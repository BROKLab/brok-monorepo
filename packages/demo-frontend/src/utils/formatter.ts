import { AxiosError } from 'axios';
import { BigNumber } from 'ethers';
import { ethers } from 'ethers';

export const formatBN = (bigNumber: BigNumber) => {
  const asInteger = parseInt(ethers.utils.formatEther(bigNumber));
  if (asInteger < 0) {
    return asInteger;
  } else {
    return Math.round(asInteger);
  }
};

export const formatCurrency = (amount: number) => {
  const moneyFormatter = () => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NOK',
    });
  };
  return moneyFormatter().format(amount);
};

export function handleAxiosError  (error: AxiosError) {
  if (error.response) {
    throw Error(error.response.data.message, error.response.data.statusCode);
  } else if (error.request) {
    throw Error('No response from server');
  } else {
    throw Error(error.message);
  }
}