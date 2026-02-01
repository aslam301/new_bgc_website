export default async function TestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Test Route Works!</h1>
        <p className="text-xl">Slug: {slug}</p>
      </div>
    </div>
  )
}
