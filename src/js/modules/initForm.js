function initForm() {


	

	document.addEventListener('DOMContentLoaded', () => {
		/*
		|--------------------------------------------------------------------------
		| 1. НАСТРОЙКИ
		|--------------------------------------------------------------------------
		|
		| TEST_MODE = true
		|  - режим проверки без PHP
		|  - форма "как будто" отправляется успешно
		|  - можно тестировать открытие модалки, отправку, показ thank you блока
		|
		| TEST_MODE = false
		|  - реальная отправка на send.php
		|  - включай это только когда PHP уже загружен на сервер
		|
		*/
		const TEST_MODE = false;
	
		/*
		|--------------------------------------------------------------------------
		| 2. URL PHP-ФАЙЛА
		|--------------------------------------------------------------------------
		|
		| Когда будешь работать по-настоящему:
		| - загрузи send.php на сервер
		| - укажи сюда его путь
		|
		| Если send.php лежит в корне сайта:
		|   const FORM_ENDPOINT = '/send.php';
		|
		| Если он на другом адресе:
		|   const FORM_ENDPOINT = 'https://site.com/send.php';
		|
		*/
		const FORM_ENDPOINT = '/send.php';
	
		/*
		|--------------------------------------------------------------------------
		| 3. ССЫЛКА НА ВИДЕО ПОСЛЕ УСПЕШНОЙ ОТПРАВКИ
		|--------------------------------------------------------------------------
		*/
		const SUCCESS_VIDEO_LINK = 'https://www.youtube.com/watch?v=AAqbqZNHTeY';
	
		/*
		|--------------------------------------------------------------------------
		| 4. ПОЛУЧАЕМ ЭЛЕМЕНТЫ СО СТРАНИЦЫ
		|--------------------------------------------------------------------------
		|
		| Чтобы этот JS работал, в HTML должны быть:
		|
		| [data-open-modal]   - кнопка открытия модалки
		| [data-modal]        - сама модалка
		| [data-close-modal]  - кнопки/область закрытия
		| #leadForm           - форма
		| [data-form-wrap]    - блок с формой
		| [data-success-wrap] - блок "спасибо"
		| [data-form-message] - место для ошибок/сообщений
		| [data-success-link] - ссылка на видео после отправки
		|
		*/
		const modal = document.querySelector('[data-modal]');
		const openButtons = document.querySelectorAll('[data-open-modal]');
		const closeButtons = document.querySelectorAll('[data-close-modal]');
		const form = document.getElementById('leadForm');
		const formWrap = document.querySelector('[data-form-wrap]');
		const successWrap = document.querySelector('[data-success-wrap]');
		const message = document.querySelector('[data-form-message]');
		const successLink = document.querySelector('[data-success-link]');
		const submitBtn = form ? form.querySelector('[type="submit"]') : null;
	
		/*
		|--------------------------------------------------------------------------
		| 5. ПРОВЕРКА: ВСЕ ЛИ ЭЛЕМЕНТЫ ЕСТЬ
		|--------------------------------------------------------------------------
		|
		| Если чего-то нет в HTML — скрипт не будет работать.
		| Это полезная проверка на старте.
		|
		*/
		if (!modal || !openButtons.length || !form || !formWrap || !successWrap || !message || !submitBtn) {
			console.warn('initForm: не найдены нужные HTML-элементы');
			return;
		}
	
		/*
		|--------------------------------------------------------------------------
		| 6. ПОДСТАВЛЯЕМ ССЫЛКУ В THANK YOU БЛОК
		|--------------------------------------------------------------------------
		*/
		if (successLink) {
			successLink.href = SUCCESS_VIDEO_LINK;
			successLink.textContent = SUCCESS_VIDEO_LINK;
		}
	
		/*
		|--------------------------------------------------------------------------
		| 7. ФУНКЦИЯ ОТКРЫТИЯ МОДАЛКИ
		|--------------------------------------------------------------------------
		*/
		const openModal = () => {
			modal.classList.add('is-open');
			document.body.style.overflow = 'hidden';
		};
	
		/*
		|--------------------------------------------------------------------------
		| 8. ФУНКЦИЯ ЗАКРЫТИЯ МОДАЛКИ
		|--------------------------------------------------------------------------
		*/
		const closeModal = () => {
			modal.classList.remove('is-open');
			document.body.style.overflow = '';
		};
	
		/*
		|--------------------------------------------------------------------------
		| 9. СБРОС СОСТОЯНИЯ МОДАЛКИ
		|--------------------------------------------------------------------------
		|
		| Когда открываем модалку заново:
		| - очищаем ошибки
		| - возвращаем форму
		| - скрываем экран успеха
		| - сбрасываем disabled у кнопки
		|
		*/
		const resetModalState = () => {
			message.textContent = '';
			form.reset();
			formWrap.hidden = false;
			successWrap.hidden = true;
			submitBtn.disabled = false;
		};
	
		/*
		|--------------------------------------------------------------------------
		| 10. ПОКАЗ ЭКРАНА УСПЕХА
		|--------------------------------------------------------------------------
		*/
		const showSuccessState = () => {
			formWrap.hidden = true;
			successWrap.hidden = false;
			message.textContent = '';
		};
	
		/*
		|--------------------------------------------------------------------------
		| 11. ПОКАЗ ОШИБКИ
		|--------------------------------------------------------------------------
		*/
		const showError = (text) => {
			message.textContent = text;
		};
	
		/*
		|--------------------------------------------------------------------------
		| 12. ОТКРЫТИЕ МОДАЛКИ ПО КНОПКЕ
		|--------------------------------------------------------------------------
		*/
		openButtons.forEach((button) => {
			button.addEventListener(
				'click',
				() => {
					resetModalState();
					openModal();
				}
			);
		});
	
		/*
		|--------------------------------------------------------------------------
		| 13. ЗАКРЫТИЕ ПО КНОПКАМ
		|--------------------------------------------------------------------------
		*/
		closeButtons.forEach((button) => {
			button.addEventListener('click', closeModal);
		});
	
		/*
		|--------------------------------------------------------------------------
		| 14. ЗАКРЫТИЕ ПО ESC
		|--------------------------------------------------------------------------
		*/
		document.addEventListener('keydown', (event) => {
			if (event.key === 'Escape' && modal.classList.contains('is-open')) {
				closeModal();
			}
		});
	
		/*
		|--------------------------------------------------------------------------
		| 15. ВАЛИДАЦИЯ ФОРМЫ
		|--------------------------------------------------------------------------
		|
		| Простая проверка:
		| - имя заполнено
		| - телефон заполнен
		| - почта заполнена и похожа на email
		|
		*/
		const validateForm = (name, phone, email) => {
			if (!name || !phone || !email) {
				return 'Пожалуйста, заполните все поля.';
			}
	
			const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	
			if (!emailPattern.test(email)) {
				return 'Введите корректную почту.';
			}
	
			return '';
		};
	
		/*
		|--------------------------------------------------------------------------
		| 16. ТЕСТОВАЯ ОТПРАВКА БЕЗ PHP
		|--------------------------------------------------------------------------
		|
		| ЭТО РЕЖИМ ПРОВЕРКИ.
		|
		| Что делает:
		| - имитирует отправку на сервер
		| - ждет 800 мс
		| - возвращает успешный ответ
		|
		| Когда использовать:
		| - пока send.php еще не загружен на сервер
		| - когда надо просто проверить фронт
		|
		| Когда удалять:
		| - можно не удалять
		| - просто переведи TEST_MODE = false
		|
		*/
		const fakeSendForm = async (formData) => {
			console.log('TEST_MODE включен');
			console.log('Форма НЕ уходит в PHP');
			console.log('Данные формы:', Object.fromEntries(formData.entries()));
	
			return new Promise((resolve) => {
				setTimeout(() => {
					resolve({
						success: true,
						message: 'Тестовая отправка прошла успешно'
					});
				}, 800);
			});
		};
	
		/*
		|--------------------------------------------------------------------------
		| 17. РЕАЛЬНАЯ ОТПРАВКА В PHP
		|--------------------------------------------------------------------------
		|
		| ЭТО РАБОЧИЙ РЕЖИМ.
		|
		| Используется только когда:
		| TEST_MODE = false
		|
		| Тут идет fetch на send.php
		|
		*/
		const realSendForm = async (formData) => {
			const response = await fetch(FORM_ENDPOINT, {
				method: 'POST',
				body: formData
			});
	
			console.log('HTTP status:', response.status);
			console.log('response.ok:', response.ok);
	
			let data = null;
	
			try {
				data = await response.json();
			} catch (error) {
				throw new Error('PHP вернул не JSON. Проверь send.php');
			}
	
			console.log('Ответ от PHP:', data);
	
			if (!response.ok) {
				throw new Error(data.message || 'Ошибка сервера');
			}
	
			return data;
		};
	
		/*
		|--------------------------------------------------------------------------
		| 18. ОБРАБОТКА ОТПРАВКИ ФОРМЫ
		|--------------------------------------------------------------------------
		*/
		form.addEventListener('submit', async (event) => {
			event.preventDefault();
	
			message.textContent = '';
	
			const formData = new FormData(form);
	
			const name = formData.get('name') ? formData.get('name').toString().trim() : '';
			const phone = formData.get('phone') ? formData.get('phone').toString().trim() : '';
			const email = formData.get('email') ? formData.get('email').toString().trim() : '';
	
			const validationError = validateForm(name, phone, email);
	
			if (validationError) {
				showError(validationError);
				return;
			}
	
			submitBtn.disabled = true;
			submitBtn.textContent = 'Отправка...';
	
			try {
				let result;
	
				/*
				|--------------------------------------------------------------------------
				| 19. ПЕРЕКЛЮЧЕНИЕ МЕЖДУ ТЕСТОМ И РЕАЛЬНОЙ ОТПРАВКОЙ
				|--------------------------------------------------------------------------
				|
				| Пока TEST_MODE = true:
				|   идет fakeSendForm()
				|
				| Когда загрузишь send.php на сервер:
				|   1. меняешь TEST_MODE на false
				|   2. проверяешь FORM_ENDPOINT
				|
				*/
				if (TEST_MODE) {
					result = await fakeSendForm(formData);
				} else {
					result = await realSendForm(formData);
				}
	
				if (result.success) {
					showSuccessState();
				} else {
					showError(result.message || 'Не удалось отправить форму.');
					submitBtn.disabled = false;
					submitBtn.textContent = 'Отправить форму';
				}
			} catch (error) {
				console.error('Ошибка отправки:', error);
				showError(error.message || 'Ошибка сети. Попробуйте ещё раз.');
				submitBtn.disabled = false;
				submitBtn.textContent = 'Отправить форму';
			}
		});
	
		/*
		|--------------------------------------------------------------------------
		| 20. ПОДСКАЗКА В КОНСОЛИ
		|--------------------------------------------------------------------------
		|
		| Это просто помощь тебе при проверке.
		|
		*/
		if (TEST_MODE) {
			console.log('Работает ТЕСТОВЫЙ режим. Форма не уходит в PHP.');
			console.log('Когда загрузишь send.php на сервер, поменяй TEST_MODE = false.');
			console.log('И проверь FORM_ENDPOINT:', FORM_ENDPOINT);
		} else {
			console.log('Работает РЕАЛЬНЫЙ режим. Отправка идет в PHP:', FORM_ENDPOINT);
		}
	});



}

export default initForm;