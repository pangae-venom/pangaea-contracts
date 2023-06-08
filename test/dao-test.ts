import { expect } from "chai";
import { Contract, Signer, Address, toNano, WalletTypes  } from "locklift";
import {Account} from"everscale-standalone-client/nodejs";
import { FactorySource } from "../build/factorySource";

let account1: Account;
let account2: Account;
let dao: Contract<FactorySource["Dao"]>;
let signer: Signer;

describe("Test Dao contract", async function () {
  before(async () => {
    signer = (await locklift.keystore.getSigner("0"))!;
    const { account: accountOneAddOperation } = await locklift.factory.accounts.addNewAccount({
      type: WalletTypes.WalletV3,
      value: toNano(10000),
      publicKey: signer.publicKey
    });
    account1 = accountOneAddOperation;
    const { account: accountTwoAddOperation } = await locklift.factory.accounts.addNewAccount({
      type: WalletTypes.WalletV3,
      value: toNano(10000),
      publicKey: (await locklift.keystore.getSigner("1"))!.publicKey
    });
    account2 = accountTwoAddOperation;
  });
  describe("Contracts", async function () {
    it("Load contract factory", async function () {
      const sampleData = await locklift.factory.getContractArtifacts("Dao");

      expect(sampleData.code).not.to.equal(undefined, "Code should be available");
      expect(sampleData.abi).not.to.equal(undefined, "ABI should be available");
      expect(sampleData.tvc).not.to.equal(undefined, "tvc should be available");
    });

    it("Deploy contract", async function () {
      const INIT_STATE = 0;
      const { contract } = await locklift.factory.deployContract({
        contract: "Dao",
        publicKey: signer.publicKey,
        initParams: {
          _nonce: locklift.utils.getRandomNonce(),
        },
        constructorParams: {
            managerPublicKey: `0x${signer.publicKey}`,
            sendRemainingGasTo: new Address("0:1c1752495dd9f211768daabb0b3df74750859da85330d4ebcc4fddc11b093ff8")
        },
        value: locklift.utils.toNano(3),
      });
      dao = contract;

      expect(await locklift.provider.getBalance(dao.address).then(balance => Number(balance))).to.be.above(0);
    });

    it("Is member",async function() {
      const result = await dao.methods.isMember({person:account1.address}).call();
      expect(result.exists).to.be.equal(false, "Wrong value");
    });

    it("Joins Dao",async function() {
      const mname = "Member1";
      await dao.methods.joinDao({name:mname}).send({from:account1.address,amount:locklift.utils.toNano(2)});
      let response = await dao.methods.isMember({person:account1.address}).call();
      expect(response.exists).to.be.equal(true, "Wrong value");

      let response2 = await dao.methods.getMember({member: account1.address}).call();
      expect(response2.value0.name).to.be.equal(mname, "Wrong value");
    });

    it("creates task", async function() {
      let response = await dao.methods.isMember({person:account1.address}).call();
      expect(response.exists).to.be.equal(true, "Wrong value");
      const bounty = locklift.utils.toNano(50);
      const sendVal = locklift.utils.toNano(52);
      const title = "Task1";
      const description = "Test Task";
      const duration = 3600;
      const points = 100;

      await dao.methods.createTask({title: title,description: description,duration:duration,points: points,bounty: bounty}).send({from:account1.address,amount:sendVal});

      const res = await dao.methods.getTask({taskID: 1}).call();
      expect(Number(res.value0.status)).to.be.equal(0, "Wrong value");
    });

    it("creates and cancels task", async function() {
      const bounty = locklift.utils.toNano(100);
      const sendVal = locklift.utils.toNano(102);
      const title = "Task2";
      const description = "Test Task 2";
      const duration = 3600;
      const points = 100;

      await dao.methods.createTask({title: title,description: description,duration:duration,points: points,bounty: bounty}).send({from:account1.address,amount:sendVal});

      const res2 = await dao.methods.getTask({taskID: 2}).call();
      expect(Number(res2.value0.status)).to.be.equal(0, "Wrong value");

      // Cancel Task

      await locklift.testing.increaseTime(400); 

      await dao.methods.cancelTask({taskID: 2}).send({from:account1.address,amount:locklift.utils.toNano(2)});
      const res3 = await dao.methods.getTask({taskID: 2}).call();
      expect(Number(res3.value0.status)).to.be.equal(3, "Wrong value");
    });

    it("claims and finishes task", async function() {
      const bounty = locklift.utils.toNano(100);
      const sendVal = locklift.utils.toNano(102);
      const title = "Task3";
      const description = "Test Task 3";
      const duration = 3600;
      const points = 100;

      await dao.methods.createTask({title: title,description: description,duration:duration,points: points,bounty: bounty}).send({from:account1.address,amount:sendVal});

      const res2 = await dao.methods.getTask({taskID: 3}).call();
      expect(Number(res2.value0.status)).to.be.equal(0, "Wrong value");

      // Member 2 joins dao

      const mname = "Member2";
      await dao.methods.joinDao({name:mname}).send({from:account2.address,amount:locklift.utils.toNano(2)});
      let response = await dao.methods.isMember({person:account2.address}).call();
      expect(response.exists).to.be.equal(true, "Wrong value");

      const res = await dao.methods.getTask({taskID: 3}).call();
      expect(res.value0.assignees.length).to.be.equal(0,"Wrong value");

      // Member 2 claims Task 3

      await locklift.testing.increaseTime(100);
      
      await dao.methods.claimTask({taskID: 3}).send({from:account2.address,amount:locklift.utils.toNano(1)});
      const res3 = await dao.methods.getTask({taskID: 3}).call();
      expect(res3.value0.assignees.length).to.be.equal(1,"Wrong value");

      // Get Member struct

      const resm = await dao.methods.getMember({member: account2.address}).call();
      expect(resm.value0.appliedTasks.length).to.be.equal(1,"Wrong value");

      // Member 2 submits task

      await locklift.testing.increaseTime(100);

      const submission = "submission string";
      await dao.methods.submitTask({taskID: 3,submission: submission}).send({from:account2.address,amount:locklift.utils.toNano(1)});

      const aTT = await dao.methods.getAssigneeToTask({assignee:account2.address,taskID: 3}).call();
      expect(Number(aTT.value0.status)).to.be.equal(1,"Wrong Value");

      // Member 1 starts review after the time is up
      await locklift.testing.increaseTime(4000);

      await dao.methods.startReview({taskID: 3}).send({from:account1.address,amount:locklift.utils.toNano(1)});

      // Member 1 finishes the task and allocates points/ pays bounty

      await locklift.testing.increaseTime(100);

      await dao.methods.finishReview({taskID: 3,winner: account2.address}).send({from:account1.address,amount:locklift.utils.toNano(1)});

      const res4 = await dao.methods.getMember({member: account2.address}).call();
      expect(Number(res4.value0.points)).to.be.equal(100, "Wrong value");
    });

    it("creates a proposal", async function() {
      const title = "Proposal 1";
      const description = "First Proposal";
      const duration = 1000;

      await dao.methods.createProposal({title:title,description: description,duration:duration}).send({from:account1.address,amount:locklift.utils.toNano(1)});

      const res = await dao.methods.getProposal({proposalID: 1}).call();
      expect(res.value0.title).to.be.equal(title, "Wrong value");

      const res2 = await dao.methods.getVote({proposalID: 1}).call();
      expect(Number(res2.value0.status)).to.be.equal(1, "Wrong value");

      const res3 = await dao.methods.getMember({member: account1.address}).call();
      expect(Number(res3.value0.createdProposals.length)).to.be.equal(1, "Wrong value");
    });

    it("votes on a proposal", async function() {
      await locklift.testing.increaseTime(100);

      //account 2 votes yes

      await dao.methods.castVote({proposalID: 1,val: 0}).send({from:account2.address,amount:locklift.utils.toNano(1)});
      const res2 = await dao.methods.getVote({proposalID: 1}).call();
      expect(Number(res2.value0.yes)).to.be.equal(1, "Wrong value");

      await locklift.testing.increaseTime(1000);

      await dao.methods.finalizeVote({proposalID: 1}).send({from:account2.address,amount:locklift.utils.toNano(1)});
      const res3 = await dao.methods.getVote({proposalID: 1}).call();
      expect(Number(res3.value0.status)).to.be.equal(2, "Wrong value");

    })

    it("fetches contract state", async function() {
      const res = await dao.methods._memberUID({} as never).call();
      expect(Number(res._memberUID)).to.be.equal(2, "Wrong value");

      const res2 = await dao.methods._numOfTasks({} as never).call();
      expect(Number(res2._numOfTasks)).to.be.equal(3, "Wrong value");

      const res3 = await dao.methods._numOfProposals({} as never).call();
      expect(Number(res3._numOfProposals)).to.be.equal(1, "Wrong value");

      const res4 = await dao.methods._numOfComments({} as never).call();
      expect(Number(res4._numOfComments)).to.be.equal(0, "Wrong value");
    })

  });
});
