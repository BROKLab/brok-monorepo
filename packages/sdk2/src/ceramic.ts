const debug = require('debug')('brok:sdk:ceramic');


export class CeramicSDK extends CeramicClient {
  constructor(public readonly ceramicUrl: string) {
    super(ceramicUrl);
  }

}