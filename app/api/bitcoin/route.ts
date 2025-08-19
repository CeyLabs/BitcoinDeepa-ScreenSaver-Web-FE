import { NextResponse } from "next/server"

let cachedData: any = null
let lastFetch = 0
const CACHE_DURATION = 3 * 60 * 1000 // 3 minutes to stay well under rate limits

const fallbackData = {
  bitcoin: {
    usd: 98500,
    lkr: 29850000,
    usd_24h_change: 2.5,
  },
  mempool: {
    count: 15000,
    vsize: 8500000,
  },
  blockHeight: 875000,
}

export async function GET() {
  try {
    const now = Date.now()

    if (cachedData && now - lastFetch < CACHE_DURATION) {
      return NextResponse.json(cachedData)
    }

    const coinGeckoResponse = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,lkr&include_24hr_change=true",
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "BitcoinDeepa-Screensaver/1.0",
        },
      },
    )

    if (!coinGeckoResponse.ok) {
      throw new Error(`CoinGecko API error: ${coinGeckoResponse.status}`)
    }

    const coinGeckoData = await coinGeckoResponse.json()

    const mempoolResponse = await fetch("https://mempool.space/api/mempool", {
      headers: {
        Accept: "application/json",
        "User-Agent": "BitcoinDeepa-Screensaver/1.0",
      },
    })

    let mempoolData = { count: 15000, vsize: 8500000 }
    if (mempoolResponse.ok) {
      mempoolData = await mempoolResponse.json()
    }

    const blockResponse = await fetch("https://mempool.space/api/blocks/tip/height", {
      headers: {
        Accept: "application/json",
        "User-Agent": "BitcoinDeepa-Screensaver/1.0",
      },
    })

    let blockHeight = 875000
    if (blockResponse.ok) {
      blockHeight = await blockResponse.json()
    }

    cachedData = {
      bitcoin: {
        usd: coinGeckoData.bitcoin.usd,
        lkr: coinGeckoData.bitcoin.lkr,
        usd_24h_change: coinGeckoData.bitcoin.usd_24h_change || 0,
      },
      mempool: {
        count: mempoolData.count,
        vsize: mempoolData.vsize,
      },
      blockHeight: blockHeight,
    }

    lastFetch = now
    return NextResponse.json(cachedData)
  } catch (error) {
    console.error("API Error:", error)

    return NextResponse.json(fallbackData)
  }
}
