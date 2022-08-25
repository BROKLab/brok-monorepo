import { BigNumber } from 'ethers';
import { ethers } from 'ethers';

export const formatCurrency = (amount: number) => {
    const moneyFormatter = () => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'NOK',
            currencyDisplay: 'code'
        });
    };
    return moneyFormatter().format(amount).replace("NOK", "").trim()
};

export const formatBN = (bigNumber: BigNumber) => {
    const asInteger = parseInt(ethers.utils.formatEther(bigNumber));
    if (asInteger < 0) {
        return formatCurrency(asInteger);
    } else {
        return formatCurrency(Math.round(asInteger));
    }
};

export const formatOrgNumber = (orgNr: string) => {
    return orgNr.split("").map((char, i) => i % 3 === 0 ? ` ${char}` : char).join("").trim()
};