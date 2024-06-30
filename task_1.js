function rate(score) {
	if (score === 0) return '★☆☆☆☆';

	const stars = Math.ceil(score / 20);
	return '★'.repeat(stars) + '☆'.repeat(5 - stars);
}
