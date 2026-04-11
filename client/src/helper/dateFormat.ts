

export function formatDate (dateString: string) : string {

    const date = new Date(dateString);
    const formattedDate = date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
    });

    return formattedDate
}


export function formatTime (dateString: string) : string {
    const date = new Date(dateString);

    const formattedTime = date.toLocaleString("en-US", {
        hour: '2-digit',
        minute: '2-digit'
    })

    return formattedTime;
}