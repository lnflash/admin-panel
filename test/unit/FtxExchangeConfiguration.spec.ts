import { SupportedExchange, SupportedInstrument } from "src/ExchangeConfiguration"
import { FtxExchangeConfiguration } from "src/FtxExchangeConfiguration"
import {
  WithdrawParameters,
  CreateOrderParameters,
  SupportedChain,
  TradeCurrency,
  TradeSide,
  TradeType,
  ApiError,
  OrderStatus,
} from "src/ExchangeTradingType"

function getValidFetchDepositAddressResponse() {
  return {
    currency: "BTC",
    address: "32fpJ48kLONfA8dCjj4MCCxuAeFBQXCeqH",
    info: {
      success: true,
      result: {
        address: "32fpJ48kLONfA8dCjj4MCCxuAeFBQXCeqH",
        tag: null,
        method: "btc",
        coin: null,
      },
    },
  }
}

function getProcessedFetchDepositAddressResponse() {
  const response = getValidFetchDepositAddressResponse()
  const chain = SupportedChain.BTC_Bitcoin
  const currency = response.currency
  const address = response.address
  return {
    originalResponseAsIs: response,
    chain: chain,
    currency: currency,
    address: address,
  }
}

function getValidWithdrawValidateInput(): WithdrawParameters {
  const args: WithdrawParameters = {
    currency: TradeCurrency.BTC,
    quantity: 1,
    address: "validAddressString",
  }
  return args
}

function getValidCreateMarketOrderValidateInput(): CreateOrderParameters {
  const args: CreateOrderParameters = {
    type: TradeType.Market,
    side: TradeSide.Buy,
    quantity: 1,
  }
  return args
}

function getValidcreateMarketOrderValidateApiResponse() {
  return { id: "validId" }
}

function getValidPrivateGetAccountResponse() {
  return {
    result: {
      collateral: "27.538257422768993",
      totalAccountValue: "27.219257422768994",
      marginFraction: "0.10308989245156817",
      positions: [
        {
          future: "BTC-PERP",
          side: "sell",
          netSize: "-0.0029",
        },
      ],
    },
  }
}

function getProcessedPrivateGetAccountResponse() {
  const response = getValidPrivateGetAccountResponse()
  const marginFraction = response.result.marginFraction
  const netSize = response.result.positions[0].netSize
  const collateral = response.result.collateral
  const totalAccountValue = response.result.totalAccountValue
  return {
    originalResponseAsIs: response,
    marginFraction: marginFraction,
    netSize: netSize,
    collateral: collateral,
    totalAccountValue: totalAccountValue,
  }
}

const falsyArgs = [null, undefined, NaN, 0, "", false]

describe("FtxExchangeConfiguration", () => {
  describe("constructor", () => {
    it("should return a FtxExchangeConfiguration", async () => {
      const configuration = new FtxExchangeConfiguration()
      expect(configuration).toBeInstanceOf(FtxExchangeConfiguration)
    })

    it("should use Ftx exchange id", async () => {
      const configuration = new FtxExchangeConfiguration()
      expect(configuration.exchangeId).toBe(SupportedExchange.FTX)
    })

    it("should use Ftx perpetual swap", async () => {
      const configuration = new FtxExchangeConfiguration()
      expect(configuration.instrumentId).toBe(SupportedInstrument.FTX_PERPETUAL_SWAP)
    })
  })

  describe("fetchDepositAddressValidateInput", () => {
    it("should do nothing when currency is BTC", async () => {
      const configuration = new FtxExchangeConfiguration()
      const result = configuration.fetchDepositAddressValidateInput(TradeCurrency.BTC)
      expect(result).toBeUndefined()
    })

    it("should throw when currency is not BTC", async () => {
      const configuration = new FtxExchangeConfiguration()

      expect(() =>
        configuration.fetchDepositAddressValidateInput(TradeCurrency.USD),
      ).toThrowError(ApiError.UNSUPPORTED_CURRENCY)
    })
  })

  describe("fetchDepositAddressProcessApiResponse", () => {
    it("should throw when response is falsy", async () => {
      const configuration = new FtxExchangeConfiguration()
      falsyArgs.forEach((response) => {
        expect(() =>
          configuration.fetchDepositAddressProcessApiResponse(response),
        ).toThrowError(ApiError.UNSUPPORTED_API_RESPONSE)
      })
    })

    it("should throw when response has no currency property", async () => {
      const configuration = new FtxExchangeConfiguration()
      const response = {
        // currency: TradeCurrency.BTC,
        address: "anything",
      }
      expect(() =>
        configuration.fetchDepositAddressProcessApiResponse(response),
      ).toThrowError(ApiError.UNSUPPORTED_CURRENCY)
    })

    it("should throw when response has no address property", async () => {
      const configuration = new FtxExchangeConfiguration()
      const response = {
        currency: TradeCurrency.BTC,
        // address: "anything",
      }
      expect(() =>
        configuration.fetchDepositAddressProcessApiResponse(response),
      ).toThrowError(ApiError.UNSUPPORTED_ADDRESS)
    })

    it(`should throw when response has no ${TradeCurrency.BTC} currency property`, async () => {
      const configuration = new FtxExchangeConfiguration()
      const response = {
        currency: "wrong",
        addr: "anything",
      }
      expect(() =>
        configuration.fetchDepositAddressProcessApiResponse(response),
      ).toThrowError(ApiError.UNSUPPORTED_CURRENCY)
    })

    it("should throw when response has no valid address property", async () => {
      const configuration = new FtxExchangeConfiguration()
      const response = {
        currency: TradeCurrency.BTC,
        address: "",
      }
      expect(() =>
        configuration.fetchDepositAddressProcessApiResponse(response),
      ).toThrowError(ApiError.UNSUPPORTED_ADDRESS)
    })

    it("should return processed response", async () => {
      const configuration = new FtxExchangeConfiguration()
      const response = getValidFetchDepositAddressResponse()
      const expected = getProcessedFetchDepositAddressResponse()
      const result = configuration.fetchDepositAddressProcessApiResponse(response)
      expect(result).toEqual(expected)
    })
  })

  describe("withdrawValidateInput", () => {
    it(`should throw when response has no ${TradeCurrency.BTC} currency property`, async () => {
      const configuration = new FtxExchangeConfiguration()
      const args = getValidWithdrawValidateInput()
      args.currency = TradeCurrency.USD
      expect(() => configuration.withdrawValidateInput(args)).toThrowError(
        ApiError.UNSUPPORTED_CURRENCY,
      )
    })

    it("should throw when response has non positive quantity property", async () => {
      const configuration = new FtxExchangeConfiguration()
      const args = getValidWithdrawValidateInput()
      const invalidQuantity = [0, -1]
      for (const quantity of invalidQuantity) {
        args.quantity = quantity
        expect(() => configuration.withdrawValidateInput(args)).toThrowError(
          ApiError.NON_POSITIVE_QUANTITY,
        )
      }
    })

    it("should throw when response has no address property", async () => {
      const configuration = new FtxExchangeConfiguration()
      const args = getValidWithdrawValidateInput()
      args.address = ""
      expect(() => configuration.withdrawValidateInput(args)).toThrowError(
        ApiError.UNSUPPORTED_ADDRESS,
      )
    })

    it("should do nothing when arguments are all valid", async () => {
      const configuration = new FtxExchangeConfiguration()
      const args = getValidWithdrawValidateInput()
      const result = configuration.withdrawValidateInput(args)
      expect(result).toBeUndefined()
    })
  })

  describe("withdrawValidateApiResponse", () => {
    it("should throw when response is falsy", async () => {
      const configuration = new FtxExchangeConfiguration()
      falsyArgs.forEach((response) => {
        expect(() => configuration.withdrawValidateApiResponse(response)).toThrowError()
      })
    })

    it("should do nothing when response is valid", async () => {
      const configuration = new FtxExchangeConfiguration()
      const response = {}
      const result = configuration.withdrawValidateApiResponse(response)
      expect(result).toBeUndefined()
    })
  })

  describe("createMarketOrderValidateInput", () => {
    it("should throw when arguments is not a supported side property", async () => {
      const configuration = new FtxExchangeConfiguration()
      const args = getValidCreateMarketOrderValidateInput()
      //   const supportedTradeSide = [TradeSide.Buy, TradeSide.Sell]
      for (const tradeSide in TradeSide) {
        if (tradeSide !== TradeSide.Buy && tradeSide !== TradeSide.Sell) {
          args.side = tradeSide as TradeSide
          expect(() => configuration.createMarketOrderValidateInput(args)).toThrowError(
            ApiError.INVALID_TRADE_SIDE,
          )
        }
      }
    })

    it("should throw when arguments has non positive quantity property", async () => {
      const configuration = new FtxExchangeConfiguration()
      const args = getValidCreateMarketOrderValidateInput()
      const invalidQuantity = [0, -1]
      for (const quantity of invalidQuantity) {
        args.quantity = quantity
        expect(() => configuration.createMarketOrderValidateInput(args)).toThrowError(
          ApiError.NON_POSITIVE_QUANTITY,
        )
      }
    })
  })

  describe("createMarketOrderValidateApiResponse", () => {
    it("should throw when response is falsy", async () => {
      const configuration = new FtxExchangeConfiguration()
      falsyArgs.forEach((response) => {
        expect(() =>
          configuration.createMarketOrderValidateApiResponse(response),
        ).toThrowError(ApiError.UNSUPPORTED_API_RESPONSE)
      })
    })

    it("should throw when response has no id property", async () => {
      const configuration = new FtxExchangeConfiguration()
      const response = {}
      expect(() =>
        configuration.createMarketOrderValidateApiResponse(response),
      ).toThrowError(ApiError.MISSING_ORDER_ID)
    })

    it("should throw when response has missing value id property", async () => {
      const configuration = new FtxExchangeConfiguration()
      const response = getValidcreateMarketOrderValidateApiResponse()
      response.id = ""
      expect(() =>
        configuration.createMarketOrderValidateApiResponse(response),
      ).toThrowError(ApiError.MISSING_ORDER_ID)
    })

    it("should do nothing when response is valid", async () => {
      const configuration = new FtxExchangeConfiguration()
      const response = getValidcreateMarketOrderValidateApiResponse()
      const result = configuration.createMarketOrderValidateApiResponse(response)
      expect(result).toBeUndefined()
    })
  })

  describe("fetchOrderValidateInput", () => {
    it("should throw when id is falsy", async () => {
      const configuration = new FtxExchangeConfiguration()
      const id = ""
      expect(() => configuration.fetchOrderValidateInput(id)).toThrowError(
        ApiError.MISSING_PARAMETERS,
      )
    })

    it("should do nothing when id is truthy", async () => {
      const configuration = new FtxExchangeConfiguration()
      const id = "validId"
      const result = configuration.fetchOrderValidateInput(id)
      expect(result).toBeUndefined()
    })
  })

  describe("fetchOrderValidateApiResponse", () => {
    it("should throw when response is falsy", async () => {
      const configuration = new FtxExchangeConfiguration()
      falsyArgs.forEach((response) => {
        expect(() => configuration.fetchOrderValidateApiResponse(response)).toThrowError(
          ApiError.UNSUPPORTED_API_RESPONSE,
        )
      })
    })

    it("should throw when response has no status property", async () => {
      const configuration = new FtxExchangeConfiguration()
      const response = {}
      expect(() => configuration.fetchOrderValidateApiResponse(response)).toThrowError(
        ApiError.UNSUPPORTED_API_RESPONSE,
      )
    })

    it("should throw when response.status is not a supported OrderStatus property", async () => {
      const configuration = new FtxExchangeConfiguration()
      const response = { status: "" }
      expect(() => configuration.fetchOrderValidateApiResponse(response)).toThrowError(
        ApiError.UNSUPPORTED_API_RESPONSE,
      )
    })

    it("should do nothing when response is valid", async () => {
      const configuration = new FtxExchangeConfiguration()
      for (const status in OrderStatus) {
        const response = { status: status }
        const result = configuration.fetchOrderValidateApiResponse(response)
        expect(result).toBeUndefined()
      }
    })
  })

  describe("privateGetAccountValidateCall", () => {
    //
    it("should do nothing and return without error", async () => {
      const configuration = new FtxExchangeConfiguration()
      const result = configuration.privateGetAccountValidateCall()
      expect(result).toBeUndefined()
    })
  })

  describe("privateGetAccountProcessApiResponse", () => {
    it("should throw when response is falsy", async () => {
      const configuration = new FtxExchangeConfiguration()
      falsyArgs.forEach((response) => {
        expect(() =>
          configuration.privateGetAccountProcessApiResponse(response),
        ).toThrowError(ApiError.UNSUPPORTED_API_RESPONSE)
      })
    })

    it("should throw when response has no result property", async () => {
      const configuration = new FtxExchangeConfiguration()
      const response = {}
      expect(() =>
        configuration.privateGetAccountProcessApiResponse(response),
      ).toThrowError(ApiError.UNSUPPORTED_API_RESPONSE)
    })

    it("should throw when response has no marginFraction property", async () => {
      const configuration = new FtxExchangeConfiguration()
      const completeResponse = getValidPrivateGetAccountResponse()
      const response = {
        result: {
          result: {
            collateral: completeResponse.result.collateral,
            totalAccountValue: completeResponse.result.totalAccountValue,
            // marginFraction: completeResponse.result.marginFraction,
            positions: completeResponse.result.positions,
          },
        },
      }
      expect(() =>
        configuration.privateGetAccountProcessApiResponse(response),
      ).toThrowError(ApiError.UNSUPPORTED_API_RESPONSE)
    })

    it("should throw when response marginFraction property is not a number", async () => {
      const configuration = new FtxExchangeConfiguration()
      const completeResponse = getValidPrivateGetAccountResponse()
      const response = {
        result: {
          result: {
            collateral: completeResponse.result.collateral,
            totalAccountValue: completeResponse.result.totalAccountValue,
            marginFraction: false,
            positions: completeResponse.result.positions,
          },
        },
      }
      expect(() =>
        configuration.privateGetAccountProcessApiResponse(response),
      ).toThrowError(ApiError.UNSUPPORTED_API_RESPONSE)
    })

    it("should throw when response has no collateral property", async () => {
      const configuration = new FtxExchangeConfiguration()
      const completeResponse = getValidPrivateGetAccountResponse()
      const response = {
        result: {
          result: {
            // collateral: completeResponse.result.collateral,
            totalAccountValue: completeResponse.result.totalAccountValue,
            marginFraction: completeResponse.result.marginFraction,
            positions: completeResponse.result.positions,
          },
        },
      }
      expect(() =>
        configuration.privateGetAccountProcessApiResponse(response),
      ).toThrowError(ApiError.UNSUPPORTED_API_RESPONSE)
    })

    it("should throw when response collateral property is not a number", async () => {
      const configuration = new FtxExchangeConfiguration()
      const completeResponse = getValidPrivateGetAccountResponse()
      const response = {
        result: {
          result: {
            collateral: false,
            totalAccountValue: completeResponse.result.totalAccountValue,
            marginFraction: completeResponse.result.marginFraction,
            positions: completeResponse.result.positions,
          },
        },
      }
      expect(() =>
        configuration.privateGetAccountProcessApiResponse(response),
      ).toThrowError(ApiError.UNSUPPORTED_API_RESPONSE)
    })

    it("should throw when response has no totalAccountValue property", async () => {
      const configuration = new FtxExchangeConfiguration()
      const completeResponse = getValidPrivateGetAccountResponse()
      const response = {
        result: {
          result: {
            collateral: completeResponse.result.collateral,
            // totalAccountValue: completeResponse.result.totalAccountValue,
            marginFraction: completeResponse.result.marginFraction,
            positions: completeResponse.result.positions,
          },
        },
      }
      expect(() =>
        configuration.privateGetAccountProcessApiResponse(response),
      ).toThrowError(ApiError.UNSUPPORTED_API_RESPONSE)
    })

    it("should throw when response totalAccountValue property is not a number", async () => {
      const configuration = new FtxExchangeConfiguration()
      const completeResponse = getValidPrivateGetAccountResponse()
      const response = {
        result: {
          result: {
            collateral: completeResponse.result.collateral,
            totalAccountValue: false,
            marginFraction: completeResponse.result.marginFraction,
            positions: completeResponse.result.positions,
          },
        },
      }
      expect(() =>
        configuration.privateGetAccountProcessApiResponse(response),
      ).toThrowError(ApiError.UNSUPPORTED_API_RESPONSE)
    })

    it("should throw when response has no positions property", async () => {
      const configuration = new FtxExchangeConfiguration()
      const completeResponse = getValidPrivateGetAccountResponse()
      const response = {
        result: {
          result: {
            collateral: completeResponse.result.collateral,
            totalAccountValue: completeResponse.result.totalAccountValue,
            marginFraction: completeResponse.result.marginFraction,
            // positions: completeResponse.result.positions,
          },
        },
      }
      expect(() =>
        configuration.privateGetAccountProcessApiResponse(response),
      ).toThrowError(ApiError.UNSUPPORTED_API_RESPONSE)
    })

    it("should get netSize of zero when response has no positions.netSize property", async () => {
      const configuration = new FtxExchangeConfiguration()
      const completeResponse = getValidPrivateGetAccountResponse()
      const response = {
        result: {
          collateral: completeResponse.result.collateral,
          totalAccountValue: completeResponse.result.totalAccountValue,
          marginFraction: completeResponse.result.marginFraction,
          positions: [
            {
              future: "BTC-PERP",
              side: "sell",
              // netSize: "-0.0029",
            },
          ],
        },
      }
      const expected = {
        originalResponseAsIs: response,
        marginFraction: response.result.marginFraction,
        netSize: 0,
        collateral: response.result.collateral,
        totalAccountValue: response.result.totalAccountValue,
      }
      const result = configuration.privateGetAccountProcessApiResponse(response)
      expect(result).toEqual(expected)
    })

    it("should return processed response", async () => {
      const configuration = new FtxExchangeConfiguration()
      const response = getValidPrivateGetAccountResponse()
      const expected = getProcessedPrivateGetAccountResponse()
      const result = configuration.privateGetAccountProcessApiResponse(response)
      expect(result).toEqual(expected)
    })
  })

  describe("fetchBalanceValidateCall", () => {
    //
    it("should throw not supported for now", async () => {
      const configuration = new FtxExchangeConfiguration()
      expect(() => configuration.fetchBalanceValidateCall()).toThrowError(
        ApiError.NOT_SUPPORTED,
      )
    })
  })

  describe("fetchBalanceProcessApiResponse", () => {
    //
    it("should throw not supported for ftx", async () => {
      const configuration = new FtxExchangeConfiguration()
      const response = {}
      expect(() => configuration.fetchBalanceProcessApiResponse(response)).toThrowError(
        ApiError.NOT_SUPPORTED,
      )
    })
  })

  describe("fetchPositionValidateInput", () => {
    //
    it("should throw not supported for ftx", async () => {
      const configuration = new FtxExchangeConfiguration()
      const id = ""
      expect(() => configuration.fetchPositionValidateInput(id)).toThrowError(
        ApiError.NOT_SUPPORTED,
      )
    })
  })

  describe("fetchPositionProcessApiResponse", () => {
    //
    it("should throw not supported for ftx", async () => {
      const configuration = new FtxExchangeConfiguration()
      const response = {}
      expect(() => configuration.fetchPositionProcessApiResponse(response)).toThrowError(
        ApiError.NOT_SUPPORTED,
      )
    })
  })
})
