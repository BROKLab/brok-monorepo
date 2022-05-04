import { TileDocumentHandler } from '@ceramicnetwork/stream-tile-handler';
import { Ceramic } from '@ceramicnetwork/core';
import { IpfsApi } from '@ceramicnetwork/common';

export const makeShareholder = (
  config: { only?: string[]; omitFields?: string[]; customFields?: any } = {}
) => {
  if (config.only?.length > 0 && config.omitFields?.length > 0 && config.customFields)
    throw Error('Cant say which fields you want and which to omit. Decide');

  const shareholder = {
    name: 'Friendster Johnson',
    birthDate: '1950-01-01',
    postalcode: 1234,
    countryCode: 'no',
    ethAddress: '0x372570802335134b5654b41Fa5eEF84548DB4d79',
    identifier: '915772137',
    identifierType: 'OrganizationNumber',
  };

  if (config.customFields) {
    Object.assign(shareholder, config.customFields);
  }

  if (config.only?.length > 0) {
    let newShareholer = {};
    config.only.forEach((field) => {
      newShareholer[field] = shareholder[field];
    });
    return {
      shareholder: newShareholer,
    };
  } else {
    config.omitFields?.forEach((field) => delete shareholder[field]);
    return {
      shareholder,
    };
  }
};

const TOPIC = '/ceramic';
export const makeCeramicCore = async (
  ipfs: IpfsApi,
  stateStoreDirectory: string
): Promise<Ceramic> => {
  const core = await Ceramic.create(ipfs, {
    pubsubTopic: TOPIC,
    stateStoreDirectory,
    anchorOnRequest: false,
  });

  const handler = new TileDocumentHandler();
  // @ts-ignore
  handler.verifyJWS = (): Promise<void> => {
    // @ts-ignore
    return;
  };
  // @ts-ignore
  core._streamHandlers.add(handler);
  return core;
};
