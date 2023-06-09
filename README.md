# pangaea-contracts

## DAO contract Layout

DAO admission is open to everyone. A member can create bounties (tasks), claim tasks created by other members, create proposals and vote on proposals created by other members. Some functions require a little fee as an anti-spamming measure and to protect the DAO but that's an open issue as far as most DAOs are concerned.

#### Tasks

All members are allowed to create tasks. Each task has a bounty attached to it and task creator can also offer points to the bounty winner. For this demo, we have allowed the creator to offer as many points as they want but for the production code we are working on a more sophisticated point allocation system. The tasks are opened for a specific duration and any member can claim the task. Any member who claims a task can submit their solutions and once the time is up, it is solely upto the task creator to pick the winner. The Task Creator can also cancel the task. The contract keeps the bounty and pays the winner once the selection is done.

#### Proposals

## DAO API

#### To become a member of the dao.
```
function joinDao(string name)
```

#### To create a task
```
function createTask(string title, string description,uint32 duration,uint32 points,uint128 bounty)
```

Member must enter title, description, duration of the task, points and bounty on offer for the winning task.

#### To claim a task
```
function claimTask(uint32 taskID)
```

Any member can claim a task and submit their solutions. Bounty creator reserves the right to accept any or no proposal.

#### To submit a task
```
function submitTask(uint32 taskID,string submission)
```

Members must claim a task first before submitting it.

#### To create a proposal
```
function createProposal(string title, string description, uint32 duration)
```

Proposal creation also initializes a vote that any member can vote on.

#### To cast a vote
```
function castVote(uint32 proposalID,uint8 val)
```

where val takes 1 (yes), 2 (no) and 3 (abstain) values.

#### To cast a vote with power
```
function castVoteWithPower(uint32 proposalID,uint8 val,uint32 N) 
```

where val takes 1 (yes), 2 (no) and 3 (abstain) values.

A voter can cast a one person one vote without locking any tokens using the function castVote() but we allow a voter to lock N number of 
tokens for the voting duration in exchange for casting N votes using castVoteWithPower() function. This isn't a perfect system obviously but it allows committed DAO members 
to be more vocal. 

#### To Finalize Vote
```
function finalizeVote(uint32 proposalID)
```

Any member can call this function to finalize voting once the end time is reached.


#### To start the task review
```
function startReview(uint32 taskID)
```

Task Creator can start review once the time has expired.

#### To finish the task review
```
function finishReview(uint32 taskID,address winner)
```

Task creator can finish the review once a winner is selected.

#### Claim bounty
```
function claimBounty()
```

Winners can claim all their outstanding earnings by calling this function.

#### Cancel Task
```
function cancelTask(uint32 taskID)
```

Task creator can cancel the task if there are no winners or otherwise. Bounty is returned to the task creator.

#### Specific State Query functions
```
function getMember(address member) 

function getTask(uint32 taskID)
    
function getProposal(uint32 proposalID)

function getVote(uint32 proposalID)

function getComment(uint128 commentID)

function getVoteCast(uint32 proposalID,address voter)

function getVoteLock(uint32 proposalID,address voter)

```
