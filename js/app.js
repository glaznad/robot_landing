"use strict";
//===========проверка email==============
function email_test(input) {
	return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(input.value);
}
//==========webP=================
function testWebP(callback) {
  var webP = new Image();
  webP.onload = webP.onerror = function () {
    callback(webP.height == 2);
  };
  webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
}

testWebP(function (support) {
  if (support === true) {
    document.querySelector('html').classList.add('_webp');
  } else {
    document.querySelector('html').classList.add('_no-webp');
  }
});


// ======Меню==========================================
const iconMenu = document.querySelector('.menu__icon');
const menuBody = document.querySelector('.menu__body');
const logo = document.querySelector('.header__logo');

const menuLinks = document.querySelectorAll('.menu__link[data-goto]');
const headerHeight = document.querySelector('header').offsetHeight;
const documentHeight = document.documentElement.clientHeight;

if (iconMenu) {
  iconMenu.addEventListener("click", function (e) {
    iconMenu.classList.toggle('_active');
    menuBody.classList.toggle('_active');
    logo.classList.toggle('_active');
  });
}

// Прокрутка при клике на пункты меню
if (menuLinks.length > 0) {
  menuLinks.forEach(menuLink => {
    menuLink.addEventListener("click", onMenuLinkClick);
  });

  function onMenuLinkClick(e) {
    const menuLink = e.target;
    if (menuLink.dataset.goto && document.querySelector(menuLink.dataset.goto)) {
      const gotoBlock = document.querySelector(menuLink.dataset.goto);
      const gotoBlockValue = gotoBlock.getBoundingClientRect().top + pageYOffset - document.querySelector('header').offsetHeight;

      if (iconMenu.classList.contains('_active')) {
        iconMenu.classList.remove('_active');
        menuBody.classList.remove('_active');
        logo.classList.remove('_active');
      }

      window.scrollTo({
        top: gotoBlockValue,
        behavior: "smooth"
      });
      e.preventDefault();
    }
  }
}

// меню при скролле
window.addEventListener('scroll', menuOnScroll);

function menuOnScroll() {
  
  for (let index = 0; index < menuLinks.length; index++) {
    const menuLink = menuLinks[index];

    if (menuLink.dataset.goto && document.querySelector(menuLink.dataset.goto)) {
      const gotoBlock = document.querySelector(menuLink.dataset.goto);
      const gotoBlockHeight = gotoBlock.offsetHeight;
      const gotoBlockTop = offset(gotoBlock).top;

      if((pageYOffset > gotoBlockTop - documentHeight) && pageYOffset < (gotoBlockTop + gotoBlockHeight - headerHeight)) {
        menuLink.classList.add('_active');
      } else {
        menuLink.classList.remove('_active');
      }
      
      // положение элемента
      function offset(elem) {
        const rect = elem.getBoundingClientRect(),
          scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
          scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
      }

    }

  }

}
//=============анимация==============================================
const animItems = document.querySelectorAll('._anim-items');
const header = document.querySelector('.header');

if (animItems.length > 0) {
  window.addEventListener('scroll', animOnScroll);
  
  function animOnScroll() {
    for (let index = 0; index < animItems.length; index++) {
      const animItem = animItems[index];
      const animItemHeight = animItem.offsetHeight;
      const headerHeight = header.offsetHeight;
      const animItemOffset = offset(animItem).top;
      const animStart = 4;

      let animItemPoint = document.documentElement.clientHeight - animItemHeight / animStart;
      if (animItemHeight > document.documentElement.clientHeight) {
        animItemPoint = document.documentElement.clientHeight - document.documentElement.clientHeight / animStart;
      }

      //когда при скролле элемент будет на четверть своей высоты, даем класс _anim
      if ((pageYOffset > animItemOffset - animItemPoint) && pageYOffset < (animItemOffset + animItemHeight - headerHeight)) {
        animItem.classList.add('_anim');
      } else {
        if (!animItem.classList.contains('_anim-no-hide')) {// _anim-no-hide - класс для э-тов, которые не хотим скроллить повторно
          animItem.classList.remove('_anim');
        }
      }
    }
  }
  // положение элемента
  function offset(elem) {
    const rect = elem.getBoundingClientRect(),
      scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
      scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
  }

  // анимация для видимой части
  setTimeout(() => {
    animOnScroll();
  }, 300);
}
// ====================Работа с формой=========================
const form = document.getElementById('form');

if (form) {
  const formSendedBody = document.querySelector('.form__sended-body');
  const formSendedBtn = document.querySelector('.form__sended-btn');
  const btnUp = document.querySelector('.button-up');
  const textMessage = document.getElementById('formMessage');
  const formСount = document.querySelector('.form__count');
  const popupMessage = document.querySelector('.popup-message');
  const closeMessage = document.querySelectorAll('.popup-close');
  const textContainers = document.querySelectorAll('.text-container');

  // редактирование текстовых полей
  for (const item of textContainers) {
    item.addEventListener('click', inputClick);
  }

  function inputClick(e) {
    let inputTarget = e.target;
    if (inputTarget.tagName == "INPUT" || inputTarget.tagName == 'TEXTAREA') {

      let labelTarget = this.getElementsByTagName('label')[0];
      if (labelTarget) {
        labelTarget.classList.add('change');
        inputTarget.addEventListener('blur', () => {
          if (inputTarget.value == '') {
            labelTarget.classList.remove('change');
          }
        });
      }
    }
  }

  // вывод количества символов в строке
  textMessage.addEventListener('input', (e) => {
    formСount.textContent = e.target.value.length;
  });

  // отправка формы
  form.addEventListener('submit', formSend);

  async function formSend(e) {
    e.preventDefault();
    let error = formValidate(form);
    let formData = new FormData(form);

    if (error === 0) {

      let response = await fetch('sendmail.php', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        let result = await response.json();

        if (result.status == 'ok') {
          form.classList.add('sended');
          formSendedBody.classList.add('sended');
          btnUp.classList.add('sended');
          formReset(form);
        } else {
          showSending(`${result.message} Причина ошибки: ${result.status}`);
        }
      } else {
        showSending(`Ошибка при отправке сообщения. Статус ошибки: ${response.status}`);
      }
    }
  }

  // проверка формы перед отправкой
  function formValidate(form) {
    let error = 0;
    let formReq = document.querySelectorAll('._req');

    for (let index = 0; index < formReq.length; index++) {
      const field = formReq[index];
      field.classList.remove('_error');

      if (field.classList.contains('form__email')) {
        if (email_test(field)) {
          addErrorMessage(field, 'Пожалуйста, введите корректный email адрес');
          field.classList.add('_error');
          error++;
        }
      } else {
        if (field.value === '') {
          addErrorMessage(field, 'Пожалуйста, заполните обязательное поле');
          field.classList.add('_error');
          error++;
        }
      }
    }
    return error;
  }

  // сообщение об ошибке
  function addErrorMessage(elem, html) {
    let message = document.createElement('div');
    message.className = "form__message-error";
    message.innerHTML = html;
    message.style.width = '100%';
    elem.after(message);
    message.style.top = elem.offsetHeight + 'px';
    message.style.left = 0;
    elem.addEventListener('input', () => {
      message.remove();
    });
  }

  // очистка формы
  function formReset(form) {
    form.reset();
    document.querySelector('.form__count').textContent = '0';
    let itemsChange = form.querySelectorAll('.change');
    for (const item of itemsChange) {
      item.classList.remove('change');
    }
  }

  // после нажатия на кнопку ОК вернуться в первоначальное состояние
  formSendedBtn.addEventListener('click', () => {
    form.classList.remove('sended');
    formSendedBody.classList.remove('sended');
    btnUp.classList.remove('sended');
  });

  //Сообщение при отправке
  function showSending(str) {
    popupMessage.classList.add('open');
    let strError = document.querySelector('.str-popup');
    strError.textContent = str;
  }

  //закрываем popup, если у него нет контента (закрываем popup по клику за его пределами)
  popupMessage.addEventListener("click", function (e) {
    if (!e.target.closest('.popup__content')) {
      popupMessage.classList.remove('open');
    }
  });

  // закрытие popup по клавише Esc
  document.addEventListener('keydown', function (e) {
    if (e.which === 27) {
      popupMessage.classList.remove('open');
    }
  });

  // закрытие popup
  for (const item of closeMessage) {
    item.addEventListener('click', () => {
      popupMessage.classList.remove('open');
    });
  }
}