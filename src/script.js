const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');
const logicalSize = 400;
const dpr = window.devicePixelRatio || 1;   // Для чёткой картинки, тут просто плотность пикселей узнаём

canvas.width = logicalSize * dpr;
canvas.height = logicalSize * dpr;

canvas.style.width = logicalSize + 'px';
canvas.style.height = logicalSize + 'px';

ctx.scale(dpr, dpr);

const width = logicalSize;
const height = logicalSize;
const center = width / 2;
const scale = 36; // Уменьшили масштаб до 36, чтобы сетка от -5 до 5 идеально умещалась внутри холста

function drawShape(r) {
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = '#3399FF';

  // первая четверть (сектор)
  ctx.beginPath();
  ctx.moveTo(center, center);
  ctx.arc(center, center, r * scale, -Math.PI / 2, 0, false);
  ctx.fill();

  // четвертая четверть (треугольник)
  ctx.beginPath();
  ctx.moveTo(center, center);
  ctx.lineTo(center + (r / 2) * scale, center); // вправо по x
  ctx.lineTo(center, center + r * scale);   //вниз по y
  ctx.closePath();
  ctx.fill();

  // третья четверть
  ctx.fillRect(center - r * scale, center, r * scale, r * scale);
}

function checkHit(x, y, r) {

  // Первая четверть
  if (x >= 0 && y >= 0) {
    return (x * x + y * y) <= (r * r);
  }

  // Вторая четверть
  if (x <= 0 && y >= 0) {
    return false;
  }

  // Третья четверть
  if (x <= 0 && y <= 0) {
    return (x >= -r) && (y >= -r);
  }

  // Четвёртая четверть
  if (x >= 0 && y <= 0) {
    return (x <= r / 2) && (y >= (2 * x - r));
  }
    return false;
}

// отрисовка осей
function drawAxes() {

  ctx.strokeStyle = 'black';
  ctx.lineWidth = 1;
  ctx.fillStyle = 'black';
  ctx.font = '11px Arial';

  ctx.beginPath();

  // Ось X (внутри границ холста)
  ctx.moveTo(10, center);
  ctx.lineTo(width - 10, center);

  // Ось Y (внутри границ холста)
  ctx.moveTo(center, 10);
  ctx.lineTo(center, height - 10);

  // Стрелка оси X
  ctx.moveTo(width - 18, center - 4);
  ctx.lineTo(width - 10, center);
  ctx.lineTo(width - 18, center + 4);

  // Стрелка оси Y
  ctx.moveTo(center - 4, 18);
  ctx.lineTo(center, 10);
  ctx.lineTo(center + 4, 18);

  ctx.stroke(); // рисуем оси и стрелки

  const values = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5];

  values.forEach(val => {
    const pos = center + val * scale;

    ctx.beginPath();
    ctx.moveTo(pos, center - 3);
    ctx.lineTo(pos, center + 3);

    if (val !== 0) {
      ctx.fillText(val, pos - 4, center + 15);
    }

    ctx.moveTo(center - 3, center - val * scale);
    ctx.lineTo(center + 3, center - val * scale);

    if (val !== 0) {
      ctx.fillText(val, center + 6, center - val * scale + 4);
    }
    ctx.stroke();
  });

  // Подписываем оси и ноль внутри границ
  ctx.fillText("X", width - 20, center - 8);
  ctx.fillText("Y", center - 15, 18);
  ctx.fillText("0", center - 10, center + 14);
}

// Возвращает численное значение выбранного чекбокса
function getSelectedR() {
  const checked = document.querySelector('.r-checkbox:checked');
  return checked ? parseFloat(checked.value) : null
}

// Достаёт данные о точках и localStorage
function getSavedPoints() {
  const data = localStorage.getItem('lab1_points');
  return data ? JSON.parse(data) : [];
}

// Сохраняет точку в общий массив и закидывать в localStorage
function savePoint(point) {
  const points = getSavedPoints();
  points.push(point);
  localStorage.setItem('lab1_points', JSON.stringify(points));
}

//
function addRowToTable(point) {
  const tbody = document.querySelector('#resultsTable tbody');
  const newRow = tbody.insertRow(0); // Вставляем наверх

  // Как раз применяем ES6 плюшки
  newRow.innerHTML = `
    <td>${point.x}</td>
    <td>${point.y}</td>
    <td>${point.r}</td>
    <td style="color: ${point.hit ? '#27ae60' : '#e74c3c'}; font-weight: bold;">
      ${point.hit ? 'Попадание' : 'Промах'}
    </td>
    <td>${point.time}</td>
      `;
}

// Отрисовывает точки на холсте
function drawPoints(currentR) {
  const points = getSavedPoints();
  points.forEach(pt => {
      const xPx = center + pt.x * scale;
      const yPx = center - pt.y * scale;

      ctx.beginPath();
      ctx.arc(xPx, yPx, 4, 0, 2 * Math.PI);

      if (pt.r === currentR) {
          ctx.fillStyle = pt.hit ? '#27ae60' : '#e74c3c';
      } else {
          ctx.fillStyle = '#95a5a6';
      }

      // Делаем чёрную обводку
      ctx.fill();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1;
      ctx.stroke();

      });
}

// Функция обновления холста и отрисовки осей и точек в правильном порядке
function redrawCanvas() {
    const r = getSelectedR();

    if (r) {
      drawShape(r);
    } else {
      ctx.clearRect(0, 0, width, height);
    }
      drawAxes();

    if (r) {
      drawPoints(r);
    }
}

const checkboxes = document.querySelectorAll('.r-checkbox');

// Слушатель всех чекбоксов, дабы нельзя было несколько галочек поставить за раз
checkboxes.forEach(cb => {
  cb.addEventListener('change', function() {
    if (this.checked) {
        // снимаем со всех галочки
        checkboxes.forEach(other => {
          if (other !== this) other.checked = false;
        });
    }
    redrawCanvas();
  });
});

redrawCanvas();

// Возвращает дату в нужном формате относительно текущей time zone (забыл слово по русски)
function getCurrentFormattedTime() {
  const now = new Date();

  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  }).format(now);
}

const form = document.getElementById('pointForm');

form.addEventListener('submit', function(event) {
  event.preventDefault();   // отменяет стандартную перезагрузку браузера

  const xVal = parseFloat(document.getElementById('x_val').value);

  const yStr = document.getElementById('y_val').value.trim().replace(',', '.');
  const yVal = parseFloat(yStr);
  const rVal = getSelectedR();

  // Валидация

  if (isNaN(yVal) || yVal <= -3 || yVal >= 5 || yStr === '') {
    alert('Ошибка ввода! Значение Y должно быть числом строго от -3 до 5.');
    return;
  }

  if (rVal === null) {
    alert('Ошибка! Пожалуйста, выберите радиус R.')
    return;
  }

  const isHit = checkHit(xVal, yVal, rVal);
  const timeString = getCurrentFormattedTime();

  const pointData = {
    x: xVal,
    y: yVal,
    r: rVal,
    hit: isHit,
    time: timeString
  };

  savePoint(pointData);

  addRowToTable(pointData);

  redrawCanvas();
});

function loadHistory() {
  const points = getSavedPoints();

  points.forEach(pt => addRowToTable(pt));

  redrawCanvas();
}

loadHistory();
