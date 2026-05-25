# Unit Economics

These are estimates, not Credex internal numbers. I used conservative assumptions so the model can be challenged and changed.

## Value Of One Converted Lead

Interview 2 described a team spending an estimated `$3,000-$5,000/month` on additional AI credits. I will use `$4,000/month` as the base converted-customer credit volume.

I do not know Credex's actual margin, so I assume Credex captures `8%` gross revenue or margin on credits purchased through it:

| Item | Calculation | Base Estimate |
| --- | ---: | ---: |
| Monthly credit volume/customer | assumption | $4,000 |
| Annual credit volume/customer | `$4,000 x 12` | $48,000 |
| Estimated Credex take rate | assumption | 8% |
| ARR per converted customer | `$48,000 x 8%` | $3,840 |
| 18-month value per converted customer | `$3,840 x 1.5` | $5,760 |

Therefore, a **converted lead** who actually purchases credits is worth about `$3,840 ARR` or `$5,760` over 18 months in this base case.

## Acquisition Cost By GTM Channel

For zero paid-budget distribution, I still count time at `$25/hour` rather than pretending acquisition is free.

| Channel | Time Cost | Expected Completed Audits | CAC Per Completed Audit |
| --- | ---: | ---: | ---: |
| `Show HN` launch and replies | 6 hours = $150 | 30 | $5.00 |
| Four LinkedIn calculation posts | 8 hours = $200 | 25 | $8.00 |
| Direct outreach to 60 engineering leads | 8 hours = $200 | 15 | $13.33 |
| Relevant community replies | 4 hours = $100 | 10 | $10.00 |
| Credex prospect/network sharing | 3 hours = $75 | 20 | $3.75 |
| **Blended first 100 audits** | **$725** | **100** | **$7.25** |

## Conversion Rate Needed For Profitability

The important funnel is:

```text
completed audit -> Credex consultation booked -> credit purchase
```

Base funnel assumption:

| Funnel Step | Rate | From 100 Completed Audits |
| --- | ---: | ---: |
| Consultation booked | 5% | 5 |
| Credit purchase from consultation | 20% | 1 |
| Converted customers | 1% overall | 1 |

At one converted customer per 100 completed audits:

```text
18-month value = 1 x $5,760 = $5,760
Acquisition time cost = 100 x $7.25 = $725
Estimated value after acquisition cost = $5,035
```

Break-even is far lower:

```text
$7.25 CAC per completed audit / $5,760 customer value = 0.126%
```

That means approximately one credit-purchasing customer per `795` completed audits covers this estimated acquisition cost. The harder question is not mathematical break-even; it is whether SpendLens attracts teams with recurring credit spend rather than mostly low-spend individuals.

## Path To $1M ARR In 18 Months

At `$3,840 ARR` per converted customer:

```text
$1,000,000 / $3,840 = 261 active credit-purchasing customers
```

At a `1%` completed-audit-to-purchase conversion rate:

```text
261 / 1% = 26,100 completed audits in 18 months
26,100 / 18 = 1,450 completed audits per month
```

For this to be credible, three things must be true: the average qualified customer's routed credit spend is near `$4,000/month`, Credex can actually capture roughly `8%`, and distribution repeatedly reaches engineering teams that buy extra credits rather than only curious free-plan users. SpendLens would need to become a recurring acquisition channel supported by Credex's existing credit conversations, public share links, and credible anonymized cost examples.
