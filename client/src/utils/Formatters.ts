export const formatTime = (seconds: number): string => {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);

	return `${hours}:${minutes.toString().padStart(2, "0")}`;
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
