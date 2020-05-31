<script>
  import { url } from '@sveltech/routify'
  import db, { DEBE, HABER } from "../db"
  import { parseYYYYMMDD } from "../helpers/date"
  import ToggleButton from "../components/ToggleButton.svelte"
  const TODAY = parseYYYYMMDD((new Date()).toLocaleDateString('es-AR'))
  let dateChosen = TODAY
  $: allTotals = db.totals.toArray()
  $: transactionsPromise = db.transactions.where({ date: dateChosen }).toArray()
  $: totalPromise = db.totals.where({ date: dateChosen }).first()
  $: getDisplayDate = () => {
    const isToday = dateChosen === TODAY
    return isToday ? 'Hoy' : dateChosen
  }

  const chooseDate = e => {
    dateChosen = e.target.value
  }

  const deleteTransaction = async e => {
    const { id } = e.currentTarget.dataset
    const transaction = await db.transactions.where({ id: parseInt(id) }).first()
    await db.transactions.where({ id: parseInt(id) }).delete()
    let todayTotal = await db.totals.where({ date: dateChosen }).first()
    if (todayTotal) {
      todayTotal = {
        ...todayTotal,
        amount: parseInt(todayTotal.amount) + (parseInt(transaction.amount) * (transaction.assetType === DEBE ? 1 : -1))
      }
      console.log(todayTotal)
      await db.totals.put(todayTotal)
    }
    transactionsPromise = db.transactions.where({ date: dateChosen }).toArray()
    totalPromise = db.totals.where({ date: dateChosen }).first()
    allTotals = db.totals.toArray()
  }

  const getShortAmount = (amount) => {
    if (amount > 999) {
      return `${amount / 1000}k`
    }

    return amount
  }

  const handleStartingSubmit = async (e) => {
    const amount = e.target.startingAmount.value || 0
    await db.totals.put({ date: TODAY, amount })
    allTotals = db.totals.toArray()
    totalPromise = db.totals.where({ date: dateChosen }).first()
  }
</script>

<style>
  form {
    width: 100%;
    margin-top: 5rem;
  }

  form label {
    font-size: 35px;
    width: 100%;
    display: block;
    font-weight: bold;
    position: relative;
  }

  form label::after {
    content: '$';
    position: absolute;
    left: 1rem;
    top: 7.25rem;
    color: var(--theme-color);
  }

  form input[type="number"] {
    font-size: 35px;
    width: 100%;
    color: var(--theme-color);
    border: 0;
    border-bottom: 6px solid var(--theme-color);
    background-color: transparent;
    padding: 1rem 1rem 1rem 3rem;
    box-sizing: border-box;
    border-radius: 6px;
    margin-top: 16px;
    margin-bottom: 22px;
  }

  form button {
    box-sizing: border-box;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--theme-color);
    border-radius: 6px;
    padding: 1rem;
    margin: 15px 0;
    cursor: pointer;
    font-size: 1rem;
    font-weight: bold;
  }

  a {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  h1 {
    text-align: center;
  }

  input[type="date"] {
    padding: 0;
    background-color: transparent;
    border: 0;
    width: 1px;
    height: 1px;
    position: absolute;
    left: -1000px;
  }

  table {
    border-spacing: 0;
    width: 100%;
    margin-top: 6rem;
    margin-bottom: 3rem;
  }

  th {
    padding: .5rem;
    font-size: 18px;
    border-right: 2px solid var(--theme-color);
    border-bottom: 6px solid var(--theme-color);
  }

  td {
    font-size: 18px;
    padding: .5rem;
    border-right: 2px solid var(--theme-color);
    border-bottom: 2px solid var(--theme-color);
  }

  td span {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  th:last-of-type, tr td:last-of-type {
    border-right: 0;
  }

  tfoot td {
    font-weight: bold;
    border-bottom: 0;
    border-right: 0;
    border-top: 4px solid var(--theme-color);
  }

  .date-label {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
  }
</style>


{#await allTotals}
  <td colspan="2">Cargando total historico...</td>
{:then allTimeTotal}
  {#if allTimeTotal.length > 0}
    <main>
      <h1>Libro Diario</h1>
      <table>
        <thead>
          <tr>
            <th width="50%">
              <label for="selected-date" class="date-label">
                {getDisplayDate()}
                <img src="images/triangle-up.svg" alt="Choose Day." width="20" height="20" />
              </label>
              <input id="selected-date" type="date" max={TODAY} on:change={chooseDate} />
            </th>
            <th>
              Debe ($)
            </th>
            <th>
              Haber ($)
            </th>
          </tr>
        </thead>
        {#await transactionsPromise}
          <p>Cargando transacciones...</p>
        {:then transactions}
          <tbody>
            {#each transactions as transaction}
              <tr>
                <td>
                  <ToggleButton {deleteTransaction} transaction={transaction} />
                </td>
                <td>
                  <span>
                    {transaction.assetType === DEBE ? getShortAmount(transaction.amount) : ''}
                  </span>
                </td>
                <td>
                  <span>
                    {transaction.assetType === HABER ? getShortAmount(transaction.amount) : ''}
                  </span>
                </td>
              </tr>
            {/each}
            {#if dateChosen === TODAY}
              <tr>
                <td>
                  <a href={$url('/add')}>
                    Agregar <img src="images/plus.svg" width="50" height="50" alt="Agregar."/>
                  </a>
                </td>
                <td></td>
                <td></td>
              </tr>
            {/if}
          </tbody>
          <tfoot>
            <tr>
              <td>
                Total: 
              </td>
              {#await totalPromise}
                <td colspan="2" style="text-align: center">
                  Cargando total...
                </td>
              {:then total}
                <td colspan="2" style="text-align: right">
                  $ {total.amount || 0}
                </td>
              {:catch error}
                <td colspan="2">
                  El total no se pudo cargar.
                </td>
              {/await}
            </tr>
            <tr>
              <td>
                Historico:
              </td>
              <td colspan="2">
                <span style="justify-content: flex-end; text-align: left">
                  $ {allTimeTotal.reduce((acc, curr) => acc + parseInt(curr.amount), 0)}
                </span>
              </td>
            </tr>
          </tfoot>
        {:catch error}
          <pre>{JSON.stringify(error)}</pre>
        {/await}
      </table>
    </main>
  {/if}
  {#if allTimeTotal.length < 1}
    <form on:submit|preventDefault={handleStartingSubmit}>
      <label for="total">Ingrese un monto para iniciar:</label>
      <input type="number" name="startingAmount" id="total" />
      <button>Continuar &rarr;</button>
    </form>
  {/if}
{:catch err}
  <td colspan="2">No se pudo cargar el total historico.</td>
{/await}
