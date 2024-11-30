export const formatTime = (seconds: number): string => {
	const date = new Date(seconds * 1000);

	const days = Math.floor(seconds / (24 * 3600));
	const hours = date.getUTCHours();
	const minutes = date.getUTCMinutes();
	const remainingSeconds = date.getUTCSeconds();

	if (days > 0) {
		return `${days}:${hours.toString().padStart(2, "0")}:${minutes
			.toString()
			.padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
	} else {
		return `${hours.toString().padStart(2, "0")}:${minutes
			.toString()
			.padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
	}
};

export const formatDuration = (duration: number) => {
	duration *= 60;
	if (duration < 60) {
		return `${duration} min`;
	} else if (duration < 1440) {
		const hours = Math.floor(duration / 60);
		return `${hours} ${hours === 1 ? "hour" : "hours"}`;
	} else {
		const days = Math.floor(duration / 1440);
		return `${days} ${days === 1 ? "day" : "days"}`;
	}
};
