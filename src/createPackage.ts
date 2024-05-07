import fse from 'fs-extra';
import { execSync } from 'child_process';
import { copySolidityFiles } from './copySolidityFiles';
import { PackageJson } from './types';
import { createReadmeAndLicense } from './createReadmeAndLicense';
import { ExportType } from './constants';

export const createPackage = (
  outDir: string,
  interfacesDir: string,
  contractsDir: string,
  packageName: string,
  exportType: ExportType,
) => {
  // Empty export destination directory
  const destinationDir = `export/${packageName}/${exportType}`;
  fse.emptyDirSync(destinationDir);

  console.log('Installing dependencies');
  execSync('yarn');

  // Read and copy the input package.json
  const inputPackageJson = fse.readJsonSync('./package.json');
  if (!inputPackageJson) throw new Error('package.json not found');
  // Create custom package.json in the export directory
  const packageJson: PackageJson = {
    name: packageName,
    version: inputPackageJson.version,
    dependencies: {
      ...inputPackageJson.dependencies,
    },
  };
  fse.writeJsonSync(`${destinationDir}/package.json`, packageJson, { spaces: 4 });

  // Copy the interfaces and their ABIs
  copySolidityFiles(outDir, interfacesDir, destinationDir);

  // Copy the contracts only if the export type is contracts
  if (exportType === ExportType.CONTRACTS) copySolidityFiles(outDir, contractsDir, destinationDir);

  createReadmeAndLicense(packageJson.name, exportType, destinationDir);
  console.log(`Created README and LICENSE`);

  // Install package dependencies
  console.log(`Installing dependencies`);
  execSync(`cd ${destinationDir} && yarn`);
};
