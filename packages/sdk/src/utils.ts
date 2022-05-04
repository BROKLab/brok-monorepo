export const checkSameSize = <T, U>(array1: T[], array2: U[]) => {
  return array1.length === array2.length;
};

export const logger = (filename: string, functionName: string, content: any) => {
  console.log(`${filename}:${functionName}: ${content}`);
};
