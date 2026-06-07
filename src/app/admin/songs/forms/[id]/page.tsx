import FormSong from "@/components/admin/songForm";

export default async function FormSongEdit({ params }: { params: { id: string } | Promise<{ id: string }> }) {
    const { id } = await params as { id:string }
    return (
        <>
            <FormSong idx={id}/>
        </>
    )
}