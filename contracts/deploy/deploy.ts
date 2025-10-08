import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedShadowStrike = await deploy("ShadowStrike", {
    from: deployer,
    log: true,
  });

  console.log(`ShadowStrike contract: `, deployedShadowStrike.address);
};
export default func;
func.id = "deploy_shadowStrike"; // id required to prevent reexecution
func.tags = ["ShadowStrike"];
