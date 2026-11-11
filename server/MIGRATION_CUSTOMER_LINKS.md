# Customer ID migration

New milk entries are saved with a stable `customerId`. Older records may still have only a customer name.

## Before running

1. Take a backup of the production MongoDB database.
2. Run this from the `server` directory with the correct production `MONGODB_URI` available in the environment.

## Run

```bash
npm ci
CONFIRM_CUSTOMER_LINK_MIGRATION=yes npm run migrate:customer-links
```

The script is safe to re-run. It links a record only when exactly one customer matches both the record owner and customer name. Ambiguous names and missing customers are skipped and reported. It does not delete records or change quantities, amounts, or payment status.
