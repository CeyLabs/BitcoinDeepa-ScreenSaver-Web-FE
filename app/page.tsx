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

export default function BitcoinDashboard() {
  const [data, setData] = useState<BitcoinData>({
    btcPriceLKR: 29850000,
    btcPriceUSD: 98500,
    satsPerLKR: 2.67,
    lkrPerSat: 0.37,
    blockHeight: 875432,
    difficulty: "109.78T",
    mempool: 15234,
    fees: 12,
  })

  const [previousData, setPreviousData] = useState<BitcoinData>(data)

  useEffect(() => {
    const interval = setInterval(() => {
      setPreviousData(data)
      setData((prev) => ({
        btcPriceLKR: prev.btcPriceLKR + (Math.random() - 0.5) * 50000,
        btcPriceUSD: prev.btcPriceUSD + (Math.random() - 0.5) * 200,
        satsPerLKR: Number((100000000 / (prev.btcPriceLKR + (Math.random() - 0.5) * 50000)).toFixed(2)),
        lkrPerSat: Number(((prev.btcPriceLKR + (Math.random() - 0.5) * 50000) / 100000000).toFixed(4)),
        blockHeight: prev.blockHeight + (Math.random() > 0.95 ? 1 : 0),
        difficulty: prev.difficulty,
        mempool: Math.max(1000, prev.mempool + Math.floor((Math.random() - 0.5) * 500)),
        fees: Math.max(1, prev.fees + Math.floor((Math.random() - 0.5) * 5)),
      }))
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
          className="filter brightness-0 invert"
        />
      </div>

      {/* Main Grid */}
      <div className="w-full max-w-7xl">
        {/* First Row - 2 Columns */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <Card className="bg-card border-border">
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

          <Card className="bg-card border-border">
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
          <Card className="bg-card border-border">
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

          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <h3 className="text-base text-muted-foreground mb-3">Difficulty</h3>
              <div className="text-3xl font-bold text-primary">
                <FlowingNumber value={data.difficulty} previousValue={previousData.difficulty} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
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

          <Card className="bg-card border-border">
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
