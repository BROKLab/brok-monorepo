// import Deployments from "./deployments_chainid_7766.json";
import brokLocal from "./DeploymentsBrokLocal.json";
import brokStage from "./DeploymentsBrokStage.json";
import brokDev from "./DeploymentsBrokDev.json";
import brokProd from "./DeploymentsBrokProd.json";
export const Deployments = {
  brokLocal,
  brokStage,
  brokDev,
  brokProd,
};

export * from "./typechain/index";
