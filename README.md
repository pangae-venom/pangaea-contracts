# pangaea-contracts

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
