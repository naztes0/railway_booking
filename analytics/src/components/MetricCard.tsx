interface Props {
    label: string
    value: string | number
    sub?: string
    color?: string
}

const MetricCard = ({ label, value, sub, color }: Props) => (
    <div className="bg-white rounded-xl shadow-sm p-4">
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        <p className="text-xl font-bold" style={{ color: color ?? '#111827' }}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
)

export default MetricCard