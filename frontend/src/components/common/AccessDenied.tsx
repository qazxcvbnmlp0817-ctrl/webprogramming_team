export default function AccessDenied({ message }: { message: string }) {
  return (
    <div className="py-24 text-center text-gray-400">
      <i className="fas fa-lock text-4xl mb-4 block" />
      <p className="text-lg font-medium text-gray-600">{message}</p>
    </div>
  )
}
