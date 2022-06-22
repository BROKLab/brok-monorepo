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

// eslint-disable-next-line node/no-missing-import
export * from "./typechain/index";
