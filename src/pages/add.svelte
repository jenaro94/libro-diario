<script>
  import { url, goto } from "@sveltech/routify"
  import db, { DEBE, HABER, CREDIT_CARD, BANK_TRANSFER, CASH } from "../db"
  import { parseYYYYMMDD } from "../helpers/date"
  let error = null;

  const handleAdd = async e => {
    if (!e.target.motive.value || 
        !e.target.amount.value || 
        !e.target.type.value || 
        !e.target['asset-type'].value) {
      error = 'Por favor completa todos los campos!'
    }

    const transaction = {
      date: parseYYYYMMDD(new Date().toLocaleDateString('es-AR')),
      motive: e.target.motive.value,
      amount: e.target.amount.value,
      type: e.target.type.value,
      assetType: e.target['asset-type'].value
    }

    await db.transactions.put(transaction)
    let todayTotal = await db.totals.where({ date: transaction.date }).first()
    if (todayTotal) {
      todayTotal = {
        ...todayTotal,
        amount: parseInt(todayTotal.amount) + (parseInt(transaction.amount) * (transaction.assetType === DEBE ? -1 : 1))
      }
      await db.totals.put(todayTotal)
    } else {
      await db.totals.put({
        date: transaction.date,
        amount: parseInt(transaction.amount) * (transaction.assetType === DEBE ? -1 : 1) 
      })
    }

    $goto('/')
  }
</script>

<style>
  h1 {
    text-align: center;
    margin-bottom: 80px;
  }

  a, button {
    box-sizing: border-box;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--red);
    border-radius: 6px;
    padding: 0 8px;
    margin: 15px 0;
    cursor: pointer;
  }

  button {
    background-color: var(--theme-color);
  }

  a span, button span {
    flex: 1;
    font-size: 18px;
    color: #222222;
    font-weight: bold;
    text-align: center;
  }

  label {
    font-size: 35px;
    width: 100%;
    display: block;
    font-weight: bold;
    position: relative;
  }

  label.money::after {
    content: '$';
    position: absolute;
    left: 1rem;
    top: 4.6rem;
    color: var(--theme-color);
  }

  input[type="text"], input[type="number"] {
    font-size: 35px;
    width: 100%;
    color: var(--theme-color);
    border: 0;
    border-bottom: 6px solid var(--theme-color);
    background-color: transparent;
    padding: 1rem;
    box-sizing: border-box;
    border-radius: 6px;
    margin-top: 16px;
    margin-bottom: 22px;
  }

  input[type="number"] {
    padding: 1rem 1rem 1rem 3rem;
  }

  .radios {
    display: flex;
    align-items: center;
    margin: 25px 0;
    border: 4px solid var(--theme-color);
    border-radius: 6px;
  }

  .radios .radio {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .radios .radio input {
    width: 1px;
    height: 1px;
    border: 0;
    padding: 0;
    background-color: transparent;
    position: absolute;
    left: -1000px;
  }

  .radios .radio label {
    display: flex;
    cursor: pointer;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    padding: 15px 0 25px 0;
    border-right: 4px solid var(--theme-color);
    transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
  }

  .radios .radio label.last {
    border-right: 0;
  }

  .radios.assets .radio label {
    flex-direction: row-reverse;
    padding: 15px 30px;
    justify-content: space-between;
  }

  .radios .radio input:checked + label {
    background-color: var(--theme-color);
    color: #ffffff;
  }
</style>

<h1>Agregar</h1>
<form on:submit|preventDefault={handleAdd}>
  <label class="money" for="amount">Monto:</label>
  <input id="amount" type="number" name="amount" />
  <label for="motive">Motivo:</label>
  <input type="text" name="motive" id="motive" />
  <label>Tipo:</label>
  <div class="radios">
    <div class="radio">
      <input type="radio" value={BANK_TRANSFER} name="type" id="banco" />
      <label for="banco">
        <img src="images/bank.svg" alt="Banco." />
        Banco
      </label>
    </div>
    <div class="radio">
      <input type="radio" value={CREDIT_CARD} name="type" id="credito" />
      <label for="credito">
        <img src="images/credit-card.svg" alt="Credito." />
        Credito
      </label>
    </div>
    <div class="radio">
      <input type="radio" value={CASH} name="type" id="cash" />
      <label for="cash" class="last">
        <img src="images/cash.svg" alt="Efectivo." />
        Efectivo
      </label>
    </div>
  </div>
  <div class="radios assets">
    <div class="radio">
      <input type="radio" value={DEBE} name="asset-type" id="debe" />
      <label for="debe">
        <img src="images/triangle-down.svg" alt="Debe." />
        Debe
      </label>
    </div>
    <div class="radio">
      <input type="radio" value={HABER} name="asset-type" id="haber" />
      <label for="haber" class="last">
        <img src="images/triangle-up.svg" alt="Haber." />
        Haber
      </label>
    </div>
  </div>
  <a href={$url('/')}>
    <span>Cancelar</span>
    <img src="images/minus.svg" width="50" height="50" alt="Cancelar."/>
  </a>
  <button>
    <span>Agregar</span>
    <img src="images/plus.svg" width="50" height="50" alt="Agregar." />
  </button>
  {#if error}
    <pre>
      {error}
    </pre>
  {/if}
</form>
