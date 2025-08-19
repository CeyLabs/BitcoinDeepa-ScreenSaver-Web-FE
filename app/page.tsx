"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

interface BitcoinData {
  btcPriceLKR: number
  btcPriceUSD: number
  satsPerLKR: number
  lkrPerSat: number
  blockHeight: number
  difficulty: string
  mempool: number
  fees: number
  priceChange24h: number
}

// Component for flowing number animation
function FlowingNumber({
  value,
  previousValue,
  suffix = "",
  prefix = "",
}: {
  value: string
  previousValue: string
  suffix?: string
  prefix?: string
}) {
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null)

  useEffect(() => {
    if (value !== previousValue) {
      // Find the first digit that changed
      const changeIndex = Array.from(value).findIndex((char, i) => char !== previousValue[i])
      if (changeIndex !== -1) {
        setAnimatingIndex(changeIndex)
        const timer = setTimeout(() => setAnimatingIndex(null), 600)
        return () => clearTimeout(timer)
      }
    }
  }, [value, previousValue])

  return (
    <span className="font-mono">
      {prefix}
      {Array.from(value).map((char, index) => (
        <span key={index} className={index >= (animatingIndex ?? Number.POSITIVE_INFINITY) ? "digit-flow" : ""}>
          {char}
        </span>
      ))}
      {suffix}
    </span>
  )
}

async function fetchBitcoinData(): Promise<Partial<BitcoinData>> {
  try {
    // Use internal API route to avoid CORS issues
    const response = await fetch("/api/bitcoin")
    const data = await response.json()

    const btcPriceUSD = data.bitcoin.usd
    const btcPriceLKR = data.bitcoin.lkr

    return {
      btcPriceUSD,
      btcPriceLKR,
      satsPerLKR: Number((100000000 / btcPriceLKR).toFixed(2)),
      lkrPerSat: Number((btcPriceLKR / 100000000).toFixed(4)),
      blockHeight: data.blockHeight,
      mempool: data.mempool.count,
      fees: 12, // Default fee rate
    }
  } catch (error) {
    console.error("Error fetching Bitcoin data:", error)
    return {}
  }
}

export default function BitcoinDashboard() {
  const [data, setData] = useState<BitcoinData>({
    btcPriceLKR: 29850000,
    btcPriceUSD: 98500,
    satsPerLKR: 3.35,
    lkrPerSat: 0.299,
    blockHeight: 875432,
    difficulty: "109.78T",
    mempool: 15234,
    fees: 12,
    priceChange24h: 2.5,
  })

  const [previousData, setPreviousData] = useState<BitcoinData>(data)
  const wsRef = useRef<WebSocket | null>(null)
  const usdToLkrRate = 303 // Fixed USD to LKR rate

  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@ticker")
      wsRef.current = ws

      ws.onopen = () => {
        console.log("[v0] Binance WebSocket connected")
      }

      ws.onmessage = (event) => {
        try {
          const tickerData = JSON.parse(event.data)
          const btcPriceUSD = Number.parseFloat(tickerData.c) // Current price
          const priceChange24h = Number.parseFloat(tickerData.P) // 24h price change percentage

          setData((prev) => {
            const btcPriceLKR = btcPriceUSD * usdToLkrRate
            const newData = {
              ...prev,
              btcPriceUSD,
              btcPriceLKR,
              satsPerLKR: Number((100000000 / btcPriceLKR).toFixed(2)),
              lkrPerSat: Number((btcPriceLKR / 100000000).toFixed(4)),
              priceChange24h,
              // Simulate minor changes for other data
              mempool: Math.max(1000, prev.mempool + Math.floor((Math.random() - 0.5) * 50)),
              blockHeight: prev.blockHeight + (Math.random() > 0.99 ? 1 : 0), // Occasional block
            }

            // Set previous data for animation comparison
            setPreviousData(prev)
            return newData
          })
        } catch (error) {
          console.error("[v0] Error parsing WebSocket data:", error)
        }
      }

      ws.onerror = (error) => {
        console.error("[v0] WebSocket error:", error)
      }

      ws.onclose = () => {
        console.log("[v0] WebSocket closed, attempting to reconnect...")
        // Reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000)
      }
    }

    connectWebSocket()

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-background p-8 flex flex-col items-center justify-center">
      {/* Logo */}
      <div className="mb-12 flex items-center justify-center">
        <Image
          src="https://blog.bitcoindeepa.com/content/images/size/w640/format/webp/2025/07/DeepaLogo_WnO.svg"
          alt="Bitcoin Deepa Logo"
          width={120}
          height={120}
          className=""
        />
      </div>

      {/* Main Grid */}
      <div className="w-full max-w-7xl">
        {/* First Row - 2 Columns */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <Card className="bg-card border-border hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl text-muted-foreground mb-4">Bitcoin Price (LKR)</h3>
              <div className="text-6xl font-bold text-primary mb-2">
                <FlowingNumber
                  value={data.btcPriceLKR.toLocaleString()}
                  previousValue={previousData.btcPriceLKR.toLocaleString()}
                  prefix="රු. "
                />
              </div>
              <div className="text-lg text-muted-foreground">
                <FlowingNumber
                  value={data.btcPriceUSD.toLocaleString()}
                  previousValue={previousData.btcPriceUSD.toLocaleString()}
                  prefix="$"
                />
              </div>
              <div className={`text-sm mt-2 ${data.priceChange24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                {data.priceChange24h >= 0 ? "+" : ""}
                {data.priceChange24h.toFixed(2)}% (24h)
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl text-muted-foreground mb-4">Satoshis ⇄ LKR</h3>
              <div className="text-3xl font-bold text-primary mb-2">
                <FlowingNumber
                  value={data.lkrPerSat.toFixed(4)}
                  previousValue={previousData.lkrPerSat.toFixed(4)}
                  prefix="1 sat = රු."
                />
              </div>
              <div className="text-2xl text-foreground mb-4">
                <FlowingNumber
                  value={data.satsPerLKR.toFixed(2)}
                  previousValue={previousData.satsPerLKR.toFixed(2)}
                  prefix="රු.1 = "
                  suffix=" sats"
                />
              </div>
              <div className="mt-4">
                <div className="text-sm text-muted-foreground mb-2">Progress to 1 sat = රු.1</div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-orange-500 transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(100, data.lkrPerSat * 100)}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-1">{(data.lkrPerSat * 100).toFixed(1)}% complete</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row - 4 Columns */}
        <div className="grid grid-cols-4 gap-6">
          <Card className="bg-card border-border hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardContent className="p-6 text-center">
              <h3 className="text-base text-muted-foreground mb-3">Block Height</h3>
              <div className="text-3xl font-bold text-primary">
                <FlowingNumber
                  value={data.blockHeight.toLocaleString()}
                  previousValue={previousData.blockHeight.toLocaleString()}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardContent className="p-6 text-center">
              <h3 className="text-base text-muted-foreground mb-3">Difficulty</h3>
              <div className="text-3xl font-bold text-primary">
                <FlowingNumber value={data.difficulty} previousValue={previousData.difficulty} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardContent className="p-6 text-center">
              <h3 className="text-base text-muted-foreground mb-3">Mempool</h3>
              <div className="text-3xl font-bold text-primary">
                <FlowingNumber
                  value={data.mempool.toLocaleString()}
                  previousValue={previousData.mempool.toLocaleString()}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardContent className="p-6 text-center">
              <h3 className="text-base text-muted-foreground mb-3">Fees (sat/vB)</h3>
              <div className="text-3xl font-bold text-primary">
                <FlowingNumber value={data.fees.toString()} previousValue={previousData.fees.toString()} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 flex items-center gap-6 text-sm text-muted-foreground">
        <a
          href="https://mempool.space"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
        >
          mempool.space
        </a>
        <span>•</span>
        <a
          href="https://google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
        >
          google
        </a>
      </div>
    </div>
  )
}
