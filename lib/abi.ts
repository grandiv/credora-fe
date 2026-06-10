/**
 * Minimal ABIs for the FE's write calls — hand-extracted from
 * ../Credora-Contract/src/*.sol (verified against the Solidity signatures).
 * Only the functions/events the FE needs are included. When the SC dev
 * publishes full ABIs (forge build → out/*.json), these can be replaced.
 */

export const AGENT_PASSPORT_ABI = [
  {
    type: "function",
    name: "registerAgent",
    stateMutability: "nonpayable",
    inputs: [
      { name: "agentName", type: "string" },
      { name: "strategyType", type: "string" },
      { name: "metadataURI", type: "string" },
      { name: "operator", type: "address" },
      { name: "strategyHash", type: "bytes32" },
    ],
    outputs: [{ name: "agentId", type: "uint256" }],
  },
  {
    type: "function",
    name: "isAuthorizedOperator",
    stateMutability: "view",
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "caller", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "event",
    name: "AgentRegistered",
    inputs: [
      { name: "agentId", type: "uint256", indexed: true },
      { name: "owner", type: "address", indexed: true },
      { name: "operator", type: "address", indexed: true },
      { name: "name", type: "string", indexed: false },
      { name: "strategyType", type: "string", indexed: false },
      { name: "metadataURI", type: "string", indexed: false },
      { name: "strategyHash", type: "bytes32", indexed: false },
    ],
  },
] as const;

export const SEASON_MANAGER_ABI = [
  {
    type: "function",
    name: "joinSeason",
    stateMutability: "nonpayable",
    inputs: [
      { name: "seasonId", type: "uint256" },
      { name: "agentId", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getSeasonAgents",
    stateMutability: "view",
    inputs: [{ name: "seasonId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    type: "event",
    name: "AgentJoinedSeason",
    inputs: [
      { name: "seasonId", type: "uint256", indexed: true },
      { name: "agentId", type: "uint256", indexed: true },
    ],
  },
] as const;

export const DECISION_LOGGER_ABI = [
  {
    type: "function",
    name: "submitDecision",
    stateMutability: "nonpayable",
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "seasonId", type: "uint256" },
      { name: "marketHash", type: "bytes32" },
      { name: "action", type: "uint8" }, // enum Long=0,Short=1,Hold=2,Alert=3
      { name: "confidence", type: "uint16" },
      { name: "riskScore", type: "uint16" },
      { name: "targetWindowSeconds", type: "uint64" },
      { name: "dataHash", type: "bytes32" },
      { name: "rationaleHash", type: "bytes32" },
      { name: "evidenceURI", type: "string" },
    ],
    outputs: [{ name: "decisionId", type: "uint256" }],
  },
  {
    type: "event",
    name: "DecisionSubmitted",
    inputs: [
      { name: "decisionId", type: "uint256", indexed: true },
      { name: "agentId", type: "uint256", indexed: true },
      { name: "seasonId", type: "uint256", indexed: true },
    ],
  },
] as const;
