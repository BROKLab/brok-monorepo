import { Organisasjon } from "../../pages/api/demo-data/companies.types"
import { RandomShareholder } from "../../pages/api/random-shareholder"

export const getRandomOrgs = async (amount: number) => {
    const company = await fetch(`/api/random-org?${new URLSearchParams({
      amount: amount.toString(),
    })}`)
    const json = await company.json()
    if ("data" in json) {
      return json.data as Organisasjon[]
    }
    throw "No data in response"
  }
  export const getRandomShareholders = async (amount: number) => {
    const company = await fetch(`/api/random-shareholder?${new URLSearchParams({
      amount: amount.toString(),
    })}`)
    const json = await company.json()
    if ("data" in json) {
      return json.data as RandomShareholder[]
    }
    throw "No data in response"
  }


  export const randomAmountInThousands = ( max: number) => {
    const amount = Math.random() * (max - 100) + 100;
    const amountRounded = Math.round(amount / 1000) * 1000
    return Math.max(amountRounded, Math.floor(Math.random() * 1000 + 1))
  }