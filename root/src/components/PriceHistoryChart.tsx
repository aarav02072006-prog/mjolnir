'use client'

import { useState, useEffect, useRef } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { format } from 'date-fns'
import { TrendingDown, TrendingUp, Minus } from 'lucide-react'

type HistoryPoint = {
  price: number
  recordedAt: string | Date
  isSimulated: boolean
}

type Period = '7d' | '30d' | '90d' | 'all'

export function PriceHistoryChart({ productId, initialHistory, currentPrice }: { productId: string, initialHistory: HistoryPoint[], currentPrice: number }) {
  const [period, setPeriod] = useState<Period>('30d')
  const [history, setHistory] = useState<HistoryPoint[]>(initialHistory)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Track initial render to skip the first fetch if period is '30d'
  const isInitialMount = useRef(true)

  // Fetch when period changes
  useEffect(() => {
    if (isInitialMount.current && period === '30d') {
      isInitialMount.current = false
      return
    }

    let isMounted = true

    async function fetchHistory() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/products/${productId}/price-history?period=${period}`)
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        if (isMounted) {
          setHistory(data.history)
        }
      } catch {
        if (isMounted) setError('Failed to load price history.')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchHistory()

    return () => { isMounted = false }
  }, [period, productId])

  // Process data for recharts
  const chartData = history.map(point => ({
    date: format(new Date(point.recordedAt), 'MMM dd'),
    price: point.price,
    fullDate: format(new Date(point.recordedAt), 'MMM dd, yyyy'),
    isSimulated: point.isSimulated
  }))
  const hasSimulatedHistory = history.some(point => point.isSimulated)

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="h-[300px] w-full flex items-center justify-center bg-card rounded-xl border border-border animate-pulse">
          <p className="text-muted-foreground">Loading history...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="h-[300px] w-full flex items-center justify-center bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
          <p>{error}</p>
        </div>
      )
    }

    if (!chartData || chartData.length < 1) {
      return (
        <div className="text-muted-foreground italic p-4 text-center border border-border rounded-xl bg-card h-[300px] flex items-center justify-center">
          No historical price records available.
        </div>
      )
    }

    const prices = chartData.map(d => d.price)
    const hasTrendData = chartData.length > 1
    const lowestPrice = Math.min(...prices)
    const highestPrice = Math.max(...prices)
    const oldestPrice = prices[0]
    const percentChange = hasTrendData ? ((currentPrice - oldestPrice) / oldestPrice) * 100 : 0
    const isDrop = percentChange < 0
    const isCurrentLowest = hasTrendData && currentPrice <= lowestPrice

    return (
      <>
        {hasTrendData ? (
          <>
            {/* Insights Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-card p-4 rounded-xl border border-border">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Current Price</p>
                <p className="text-2xl font-bold text-foreground">₹{currentPrice}</p>
              </div>

              <div className="bg-card p-4 rounded-xl border border-border">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Lowest Price</p>
                <p className="text-2xl font-bold text-green-500">₹{lowestPrice}</p>
              </div>

              <div className="bg-card p-4 rounded-xl border border-border">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Highest Price</p>
                <p className="text-2xl font-bold text-foreground">₹{highestPrice}</p>
              </div>

              <div className={`p-4 rounded-xl border ${isDrop ? 'bg-green-500/10 border-green-500/20' : percentChange > 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-card border-border'}`}>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Change ({period})</p>
                <div className={`flex items-center text-xl font-bold ${isDrop ? 'text-green-500' : percentChange > 0 ? 'text-red-500' : 'text-foreground'}`}>
                  {isDrop ? <TrendingDown className="h-5 w-5 mr-1" /> : percentChange > 0 ? <TrendingUp className="h-5 w-5 mr-1" /> : <Minus className="h-5 w-5 mr-1" />}
                  {Math.abs(percentChange).toFixed(1)}%
                </div>
              </div>
            </div>

            {isCurrentLowest && (
              <div className="mb-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 text-green-500 px-4 py-3 rounded-lg flex items-center">
                <span className="flex h-2 w-2 relative mr-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <strong>Great Deal!</strong>&nbsp;The current price is the lowest recorded in this period.
              </div>
            )}
          </>
        ) : (
          <div className="mb-6 rounded-xl border border-border bg-muted/30 p-4">
            <p className="text-sm font-semibold text-foreground">Latest recorded price: ₹{chartData[0].price}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {chartData[0].fullDate} · More price updates are needed to show a trend. The recorded price is plotted below.
            </p>
          </div>
        )}

        {/* Chart */}
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#888' }}
                dy={10}
              />
              <YAxis
                domain={['dataMin - 100', 'dataMax + 100']}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#888' }}
                tickFormatter={(val) => `₹${val}`}
              />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#111', color: '#fff' }}
                labelStyle={{ fontWeight: 'bold', color: '#888', marginBottom: '4px' }}
                formatter={(value) => [`₹${value}`, 'Price']}
                labelFormatter={(_, payload) => payload[0]?.payload.fullDate}
              />
              <ReferenceLine y={lowestPrice} stroke="#10B981" strokeDasharray="3 3" strokeOpacity={0.5} />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#ec008c"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: '#111', stroke: '#ec008c' }}
                activeDot={{ r: 6, fill: '#ec008c', stroke: '#fff', strokeWidth: 2 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </>
    )
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Price History Insights</h2>
          <p className="text-sm text-muted-foreground">Track price movements to get the best deal.</p>
        </div>

        {/* Period Selector */}
        <div className="flex bg-background border border-border rounded-lg p-1">
          {(['7d', '30d', '90d', 'all'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              disabled={isLoading}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                period === p
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {p === 'all' ? 'All' : p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {hasSimulatedHistory && (
        <p className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          Demo data: this simulated price history illustrates the chart and does not represent actual past prices.
        </p>
      )}

      {renderContent()}
    </div>
  )
}
