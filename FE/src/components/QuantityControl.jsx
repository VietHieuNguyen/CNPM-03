import { Minus, Plus } from 'lucide-react'

const QuantityControl = ({ value, onChange, min = 1, max = 999 }) => {
  const decrease = () => { if (value > min) onChange(value - 1) }
  const increase = () => { if (value < max) onChange(value + 1) }

  return (
    <div className="flex items-center gap-0 bg-white rounded-xl overflow-hidden border border-wabi-border">
      <button
        onClick={decrease}
        disabled={value <= min}
        className="w-10 h-10 flex items-center justify-center text-wabi-muted hover:text-wabi-red hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        id="qty-decrease-btn"
      >
        <Minus size={16} />
      </button>
      <span className="w-12 text-center font-bold text-wabi-text text-sm border-x border-wabi-border">{value}</span>
      <button
        onClick={increase}
        disabled={value >= max}
        className="w-10 h-10 flex items-center justify-center text-wabi-muted hover:text-wabi-green hover:bg-green-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        id="qty-increase-btn"
      >
        <Plus size={16} />
      </button>
    </div>
  )
}

export default QuantityControl
