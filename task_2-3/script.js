const response = await fetch('cards.json');
const cardsDataJSON = await response.json();
const prevButton = document.querySelector('.button__left');
const nextButton = document.querySelector('.button__right');
let cardsData;
let currentPage = 1;
let notesOnPage = 4;

const getCardsLocalStorage = () => {
	return JSON.parse(localStorage.getItem('cards'));
};

const setCardsLocalStorage = cards => {
	localStorage.setItem('cards', JSON.stringify(cards));
};

localStorage.clear();

const getCardsData = () => {
	const cards = getCardsLocalStorage();
	cardsData = cards || cardsDataJSON;
	setCardsLocalStorage(cardsData);
};

const clearCardsLocalStorage = () => {
	localStorage.removeItem('cards');
};

getCardsData();

const cards = document.querySelector('.cards');
const pagination = document.querySelector('.pagination__list');

const deleteCard = (pageNum, index) => {
	const cardsIndex = (pageNum - 1) * notesOnPage + index;
	cardsData.splice(cardsIndex, 1);

	const totalPages = Math.ceil(cardsData.length / notesOnPage);
	if (currentPage > totalPages && currentPage > 1) {
		currentPage--;
	}

	setCardsLocalStorage(cardsData);
	createCardsOnPage(currentPage);
	createPagination();
	handlePagination();
};

const toggleDeleteButton = (index, forceShow) => {
	const deleteBtn = document.querySelector(
		`.card:nth-child(${index + 1}) .delete-button`
	);
	const deleteBcg = document.querySelector(
		`.card:nth-child(${index + 1}) .delete-background`
	);

	if (window.innerWidth < 798) {
		const show =
			forceShow !== undefined ? forceShow : deleteBtn.style.display !== 'block';
		deleteBtn.style.display = show ? 'block' : 'none';
		deleteBcg.style.display = show ? 'block' : 'none';
	}
};

const createCardElement = (card, index) => {
	const newCard = document.createElement('div');
	newCard.classList.add('card');

	newCard.innerHTML = `
			<div class="card__image">
					<img src="${card.Image}" alt="image">
					<button class="delete-button delete-background"></button>
			</div>
			<div class="card__info">
					<div class="card__title">
							<h2 class="card__name">${card.Name}</h2>
							<h2 class="card__price">${card.Price} ₽</h2>
					</div>
					<p class="card__desc">${card.Description}</p>
			</div>
	`;

	const deleteBtn = newCard.querySelector('.delete-button');
	deleteBtn.addEventListener('click', () => deleteCard(currentPage, index));

	const cardImage = newCard.querySelector('.card__image');
	cardImage.addEventListener('click', () => toggleDeleteButton(index));

	newCard.addEventListener('mouseenter', () => {
		if (window.innerWidth >= 798) {
			deleteBtn.classList.add('show');
			newCard.querySelector('.delete-background').classList.add('show');
		}
	});

	newCard.addEventListener('mouseleave', () => {
		if (window.innerWidth >= 798) {
			deleteBtn.classList.remove('show');
			newCard.querySelector('.delete-background').classList.remove('show');
		}
	});

	return newCard;
};

const createCardForm = () => {
	const addCardForm = document.createElement('form');
	addCardForm.id = 'addCardForm';

	addCardForm.innerHTML = `
		<label class="input-file" title="Загрузить">
			<input type="file" name="file" id="cardImage" required>
			<span>+</span>
			<span>Upload</span>
			<img id="imagePreview" alt="Image preview" style="display:none;"/>
		</label>

		<label for="cardName">Название товара:</label>
		<input type="text" id="cardName" name="cardName" required />

		<label for="cardPrice">Цена товара:</label>
		<input type="text" id="cardPrice" name="cardPrice" required />

		<label for="cardDescription">Описание товара:</label>
		<textarea id="cardDescription" name="cardDescription" required></textarea>

		<button type="submit" id="cardButton">Добавить карточку</button>
	`;

	const cardImageInput = addCardForm.querySelector('#cardImage');
	const imagePreview = addCardForm.querySelector('#imagePreview');
	const inputFileLabel = addCardForm.querySelector('.input-file');

	cardImageInput.addEventListener('change', event => {
		const file = event.target.files[0];
		if (file) {
			const spans = inputFileLabel.querySelectorAll('span');
			spans.forEach(span => span.remove());

			const reader = new FileReader();
			reader.onload = () => {
				imagePreview.src = reader.result;
				imagePreview.style.display = 'block';
			};
			reader.readAsDataURL(file);
		}
	});

	addCardForm.addEventListener('submit', async event => {
		event.preventDefault();

		const cardName = document.getElementById('cardName').value;
		const cardPrice = document.getElementById('cardPrice').value;
		const cardDescription = document.getElementById('cardDescription').value;
		const cardImageFile = cardImageInput.files[0];

		if (!cardImageFile) {
			alert('Пожалуйста, выберите файл изображения');
			return;
		}

		const newCard = {
			Name: cardName,
			Price: cardPrice,
			Description: cardDescription,
			Image: await toBase64(cardImageFile),
		};

		cardsData.push(newCard);
		setCardsLocalStorage(cardsData);
		createCardsOnPage(currentPage);
		handlePagination();
	});

	return addCardForm;
};

const toBase64 = file =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result);
		reader.onerror = error => reject(error);
	});

const createForms = () => {
	if (currentPage === Math.ceil(cardsData.length / notesOnPage)) {
		const addCardForm = createCardForm();
		cards.appendChild(addCardForm);
	}
};

const createCards = (data, notes) => {
	cards.innerHTML = '';

	data
		.slice((currentPage - 1) * notes, currentPage * notes)
		.forEach((card, index) => {
			const cardElement = createCardElement(card, index);
			cards.appendChild(cardElement);
		});
};

const getNotesOnPage = () => {
	let windowInnerWidth = window.innerWidth;
	const previousNotesOnPage = notesOnPage;
	notesOnPage = windowInnerWidth < 798 ? 2 : 4;
	if (previousNotesOnPage !== notesOnPage) {
		const totalPages = Math.ceil(cardsData.length / notesOnPage);
		if (currentPage > totalPages) {
			currentPage = totalPages;
		}

		createCardsOnPage(currentPage);
		createPagination();
		setActivePage();
	}
};

const checkWindowSize = () => {
	getNotesOnPage();
};

window.addEventListener('resize', checkWindowSize);

const createPagination = () => {
	pagination.innerHTML = '';

	const countOfItems = Math.ceil(cardsData.length / notesOnPage);
	for (let i = 1; i <= countOfItems; i++) {
		const paginationItem = document.createElement('li');
		paginationItem.innerHTML = i;
		paginationItem.addEventListener('click', switchPage);
		pagination.appendChild(paginationItem);
	}
	setActivePage();
};

const switchPage = event => {
	currentPage = +event.target.innerHTML;
	createCardsOnPage(currentPage);
};

const createCardsOnPage = page => {
	createCards(cardsData, notesOnPage);
	setActivePage();
	createForms();
};

const setActivePage = () => {
	Array.from(pagination.children).forEach(page => {
		page.classList.toggle('active', +page.innerHTML === currentPage);
	});
};

const handlePagination = () => {
	createPagination();
};

createCardsOnPage(currentPage);
getNotesOnPage();
handlePagination();

prevButton.addEventListener(
	'click',
	() => currentPage > 1 && createCardsOnPage(--currentPage)
);

nextButton.addEventListener(
	'click',
	() =>
		currentPage < Math.ceil(cardsData.length / notesOnPage) &&
		createCardsOnPage(++currentPage)
);

const chat = document.getElementById('chat');
const questions = [
	'Какой у вас любимый цвет одежды?',
	'Какой у вас размер одежды?',
	'Сколько вы обычно готовы потратить на одежду?',
];
let currentQuestion = 0;
let textarea = null;

function showQuestion() {
	if (currentQuestion >= questions.length) {
		showThankYouMessage();
		return;
	}

	const question = questions[currentQuestion];
	const answer = localStorage.getItem(`answer${currentQuestion}`);
	const questionP = document.createElement('p');
	questionP.textContent = question;
	questionP.classList.add('question');
	chat.appendChild(questionP);

	if (answer) {
		const answerP = document.createElement('p');
		answerP.textContent = answer;
		answerP.classList.add('answer');
		chat.appendChild(answerP);
		chat.scrollTop = chat.scrollHeight;
		currentQuestion++;
		setTimeout(() => {
			showQuestion();
		}, 2000);
	} else {
		if (!textarea) {
			textarea = document.createElement('textarea');
			textarea.placeholder = 'Write a message';
			textarea.addEventListener('keydown', handleTextareaEnter);
			chat.appendChild(textarea);
		}

		chat.appendChild(textarea);
		textarea.focus();
		chat.scrollTop = chat.scrollHeight;
	}
}

function handleTextareaEnter(event) {
	if (event.key === 'Enter' && !event.shiftKey) {
		event.preventDefault();

		const answer = textarea.value.trim();
		if (answer) {
			localStorage.setItem(`answer${currentQuestion}`, answer);

			const answerP = document.createElement('p');
			answerP.textContent = answer;
			answerP.classList.add('answer');
			chat.insertBefore(answerP, textarea);
			textarea.value = '';
			currentQuestion++;
			setTimeout(() => {
				showQuestion();
			}, 2000);
		}
	}
}

function showThankYouMessage() {
	const thankYouP = document.createElement('p');
	thankYouP.textContent = 'Спасибо за ваши ответы!';
	thankYouP.classList.add('question');
	chat.insertBefore(thankYouP, textarea);
	chat.scrollTop = chat.scrollHeight;
}

function initializeChat() {
	const totalQuestions = questions.length;
	let allAnswered = true;

	for (let i = 0; i < totalQuestions; i++) {
		if (!localStorage.getItem(`answer${i}`)) {
			allAnswered = false;
			break;
		}
	}

	if (allAnswered) {
		localStorage.clear();
		currentQuestion = totalQuestions;
	}

	showQuestion();
}

initializeChat();
