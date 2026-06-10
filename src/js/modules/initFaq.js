function initFaq() {
	const accordion = document.querySelector('[data-accordion]');

	if (!accordion) {
		return;
	}

	const items = accordion.querySelectorAll('.faq-item');

	if (!items.length) {
		return;
	}

	function closeItem(item) {
		const body = item.querySelector('.faq-item__body');

		if (!body) {
			return;
		}

		item.classList.remove('is-open');
		body.style.maxHeight = '0px';
	}

	function openItem(item) {
		const body = item.querySelector('.faq-item__body');

		if (!body) {
			
			return;
		}

		item.classList.add('is-open');
		body.style.maxHeight = body.scrollHeight + 'px';

	
	}

	items.forEach((item, index) => {
		const button = item.querySelector('.faq-item__head');
		const body = item.querySelector('.faq-item__body');


		if (!button || !body) {
		
			return;
		}

		if (item.classList.contains('is-open')) {
			body.style.maxHeight = body.scrollHeight + 'px';
		
		} else {
			body.style.maxHeight = '0px';
		
		}

		button.addEventListener('click', () => {
			const isOpen = item.classList.contains('is-open');
		

			items.forEach((currentItem, currentIndex) => {
				if (currentItem !== item) {
					closeItem(currentItem);
		
				}
			});

			if (isOpen) {
				closeItem(item);
			
			} else {
				openItem(item);
			
			}
		});
	});

	window.addEventListener('resize', () => {
	

		items.forEach((item, index) => {
			const body = item.querySelector('.faq-item__body');

			if (item.classList.contains('is-open') && body) {
				body.style.maxHeight = body.scrollHeight + 'px';
			
			}
		});
	});

}

export default initFaq;