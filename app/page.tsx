"use client"

import { useState, useEffect } from "react"
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
  })

  const [previousData, setPreviousData] = useState<BitcoinData>(data)

  useEffect(() => {
    fetchBitcoinData().then((newData) => {
      if (Object.keys(newData).length > 0) {
        setData((prev) => ({ ...prev, ...newData }))
      }
    })

    const interval = setInterval(async () => {
      setPreviousData(data)

      const shouldFetchReal = Math.random() > 0.97 // ~3% chance every second = real fetch every ~30 seconds

      if (shouldFetchReal) {
        const newData = await fetchBitcoinData()
        if (Object.keys(newData).length > 0) {
          setData((prev) => ({ ...prev, ...newData }))
        }
      } else {
        // Minor simulated fluctuations between real fetches
        setData((prev) => {
          const newBtcPriceLKR = prev.btcPriceLKR + (Math.random() - 0.5) * (prev.btcPriceLKR * 0.001) // 0.1% max change
          const newBtcPriceUSD = prev.btcPriceUSD + (Math.random() - 0.5) * (prev.btcPriceUSD * 0.001)
          return {
            ...prev,
            btcPriceLKR: newBtcPriceLKR,
            btcPriceUSD: newBtcPriceUSD,
            satsPerLKR: Number((100000000 / newBtcPriceLKR).toFixed(2)),
            lkrPerSat: Number((newBtcPriceLKR / 100000000).toFixed(4)),
            mempool: Math.max(1000, prev.mempool + Math.floor((Math.random() - 0.5) * 100)),
          }
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [data])

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
