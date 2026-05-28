export interface FeaturedCardProps {
  category: string
  title: string
  date: string
  meta: string
}

export default function FeaturedCard({ category, title, date, meta }: FeaturedCardProps) {
  return (
    <section className="mb-8">
      <div className="relative border-2 border-black overflow-hidden">
        <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
          <i className="fas fa-image text-5xl text-gray-400" />
        </div>
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-5">
          <span className="inline-block bg-white text-black text-xs font-bold px-2 py-0.5 mb-2">
            {category}
          </span>
          <h2 className="text-white text-xl font-bold leading-tight">{title}</h2>
          <p className="text-gray-300 text-sm mt-1">
            {date}&nbsp;·&nbsp;{meta}
          </p>
        </div>
      </div>
    </section>
  )
}
