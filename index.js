(function () {
  if (typeof window.CustomEvent === 'function') return false;
  function CustomEvent(event, params) {
    params = params || { bubbles: false, cancelable: false, detail: null };
    var evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }
  window.CustomEvent = CustomEvent;
})();

const templateSelect = (data = [], defaultText = '') => {
  let items = [];

  data.forEach(item => {
    let classItemSelected = (item === defaultText) ? ' select__item_selected' : '';
    items.push(`<li class="select__item${classItemSelected}" data-select="item">${item}</li>`);
  });

  return `
  <div class="select__backdrop" data-select="backdrop"></div>
  <button type="button" class="select__trigger" data-select="trigger">
    ${defaultText}
  </button>
  <div class="select__dropdown">
    <ul class="select__items">
      ${ items.join('') }
    </ul>
  </div>`;
};

class Select {
  constructor (config) {
		this._config = config || {};
		this._$selector = document.querySelector(this._config.selector);

		(async () => {
			this._$data = await this._getItems(this._config.url);
			if (this._$data) {
				this._render();
			}
			this._$trigger = this._$selector.querySelector('[data-select="trigger"]');
			this._addEventListener();
		})();
  }

	_eventHandler(e) {
    let $target = e.target;
    let type = $target.dataset.select;

    if (!type) {
      $target = $target.closest('[data-select]');
      type = $target.dataset.select;
    }
    if (type === 'trigger') {
      this.toggle();
    } else if (type === 'item') {
      this._changeItem($target);
      this.hide();
    } else if (type === 'backdrop') {
      // закрываем селект, если кликнули вне его
      this.hide();
    }
  }
	_isShow() {
    return this._$selector.classList.contains('select_show');
  }
	show() {
    this._$selector.classList.add('select_show');
  }
  hide() {
    this._$selector.classList.remove('select_show');
  }
  toggle() {
    this._isShow() ? this.hide() : this.show();
  }
	_changeItem(item) {
    if (!item.classList.contains('select__item_selected')) {
      const itemSelected = this._$selector.querySelector('.select__item_selected');
      if (itemSelected) {
        itemSelected.classList.remove('select__item_selected');
      }
      item.classList.add('select__item_selected');
      this._$trigger.textContent = item.textContent;
      this._$selector.dispatchEvent(this._changeValue);
      this._config.onSelected ? this._config.onSelected(item) : null;
    }
  }

	_addEventListener () {
    this._eventHandler = this._eventHandler.bind(this);
    this._$selector.addEventListener('click', this._eventHandler);
		this._changeValue = new CustomEvent('select.change');
  }

	_render() {
    if (!this._$selector.classList.contains('select')) {
      this._$selector.classList.add('select');
    }
    this._$selector.innerHTML = templateSelect(this._$data, this._config['label']);
  }

	destroy() {
    this._$selector.removeEventListener('click', this._eventHandler);
    this._$selector.innerHTML = '';
  }

	selectedItem(value) {
    if (typeof value === 'object') {
      if (value['value']) {
        this._$selector.querySelectorAll('[data-select="item"]').forEach($item => {
          if ($item.textContent.trim() === value['value'].toString()) {
            this._changeItem($item);
            return;
          }
        });
      } else if (value['index'] >= 0) {
        const $item = this._$selector.querySelectorAll('[data-select="item"]')[value['index']];
        this._changeItem($item);
      }
      return this.selectedItem();
    }
    let indexSelected = -1;
    let valueSelected = '';
    this._$selector.querySelectorAll('[data-select="item"]').forEach(($element, index) => {
      if ($element.classList.contains('select__item_selected')) {
        indexSelected = index;
        valueSelected = $element.textContent;
      }
    });
    return { index: indexSelected, value: valueSelected };
  }

	 _getItems (url) {
		return Promise.resolve(
			fetch(url)
				.then(res => res.json())
				.then(res => res.map(i => i.title).slice(0, 10).map(i => i.slice(0, 5)))
		);
  };
}

const select = new Select({
	selector: '#select',
	label: 'Выберите из списка',
	url: 'https://jsonplaceholder.typicode.com/todos',
	onSelect(selectedItem) {
		console.log(`Выбран элемент с названием '${selectedItem}'`)
	}
})
