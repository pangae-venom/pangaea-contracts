import { Address } from "locklift";

async function main() {
    const signer = (await locklift.keystore.getSigner("0"))!;
    const { contract: dao, tx } = await locklift.factory.deployContract({
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
  
    console.log(`Dao deployed at: ${dao.address.toString()}`);
  }
  
  main()
    .then(() => process.exit(0))
    .catch(e => {
      console.log(e);
      process.exit(1);
    });
  