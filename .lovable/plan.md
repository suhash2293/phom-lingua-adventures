

## Plan: Remove Phom Translation from Numbers Category

Remove the Phom translation "Nyihthü" from the Numbers learning module header.

---

### Current State

| Field | Current Value |
|-------|---------------|
| Category ID | 7850d83c-450e-4006-96e2-4878977e42f4 |
| Name | Numbers |
| Phom Name | Nyihthü |
| Singular Name | NULL |
| Singular Phom Name | NULL |

---

### Database Update

Set `phom_name` to NULL to remove the Phom translation from the module header:

```sql
UPDATE categories 
SET phom_name = NULL, updated_at = now()
WHERE id = '7850d83c-450e-4006-96e2-4878977e42f4';
```

---

### Result

The Numbers module header will display only the English title "Numbers" without the Phom translation, matching the minimalist header style used in other modules like Bible Vocabularies.

