import StreamForm from '@/components/admin/streamForm'

export default async function EditStreamPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <StreamForm id={id} /> }