<script>
  import { fly } from 'svelte/transition'
  let showDelete = false
  export let transaction;
  export let deleteTransaction;
  import { BANK_TRANSFER, CREDIT_CARD, CASH } from '../db'
  const getIcon = (type) => {
    if (type === CASH) return 'images/cash.svg'
    if (type === CREDIT_CARD) return 'images/credit-card.svg'
    if (type === BANK_TRANSFER) return 'images/bank.svg'

    return ''
  }
</script>

<style>
  button {
    padding: 0;
    border: 0;
    cursor: pointer;
    font-size: inherit;
    width: 100%;
    background-color: transparent;
  }

  span.icon {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  div {
    display: flex;
    align-items: center;
    width: 100%;
  }

  div button {
    background-color: var(--red);
    color: #ffffff;
    height: 54px;
    font-size: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  div > button:first-of-type {
    background-color: var(--theme-color);
    border-right: 4px solid #ebebeb;
    color: #ffffff;
  }
</style>

{#if !showDelete}
  <button in:fly data-id={transaction.id} on:click={() => showDelete = true}>
    <span class="icon">
      {transaction.motive}
      <img width="50" height="50" src={getIcon(transaction.type)} alt={transaction.motive} />
    </span>
  </button>
{:else}
  <div in:fly>
    <button on:click={() => showDelete = false}>
      &larr;
    </button>
    <button data-id={transaction.id} on:click={deleteTransaction}>
      <img src="images/minus.svg" alt="Eliminar." width="50" height="50" />
    </button>
  </div>
{/if}
