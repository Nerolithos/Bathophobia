# Mailbox commissions / 信箱委托

基地竣工后在建造页建信箱：铜 ×5、原木 ×1、瓦片 ×2。首次及后续来信间隔为 5–7 次完成的探洞，B 侧栏显示已收到的委托。交付只使用地表仓库，检查全部材料后统一扣除，奖励不可重复领取。

Build the mailbox after completing the homestead: 5 copper, 1 timber, 2 roof tiles. Letters arrive after 5–7 expeditions; open B to claim them using surface storage.

- 茶道大师 / Tea master: 磷肥 ×42 + 粘土 ×42。完成后实际喝到茶才领取一个随机正面蘑菇效果，保留给下一次正式探洞，整局有效，不重复叠加。Demo 不消耗待用奖励。蘑菇与茶道拥有独立效果槽，头顶提示以绿色/红色区分正负。
- 矿物同好 / Fellow collector: 洞穴中自然获得的 26 种矿物各一份（包含两种萤石、粘土，不包含加工品、家具、砂石或奖励本身）。专属合辑图标仅用于该委托；展开可看清单。唯一奖励：水硅钒钙石 Cavansite，永不自然生成、不可合成。

`src/commissions.js` owns construction, delivery, atomic claims, tea lifecycle and mailbox rendering. `home.mail` persists delivery deadlines, received/completed IDs and pending/active tea effects. Existing vault/discovery IDs remain unchanged; Cavansite appends ID 55.

Cavansite: Ca(VO)Si₄O₁₀·4H₂O, orthorhombic, Mohs 3–4. Secondary mineral in cavities/fractures of altered basalt and related volcanic rocks. Source: [Handbook of Mineralogy](https://handbookofmineralogy.org/pdfs/cavansite.pdf). Artwork source and generation prompt are preserved under `assets/characters/player-detail/`; the packed transparent sprite uses nearest-neighbor pixels and cached animated glints.

`/2Afin-admin` includes the mailbox through the full-construction registry. “Mail test / 信箱验收” supplies both letters and their outstanding materials only in the isolated preview save; use the real Complete buttons and tea animation to test rewards. Public progression still uses 5–7 expeditions.

Validation: `verify-commissions.cjs` covers construction gates/costs, delivery timing, atomic claims, one-time rewards, old saves, positive tea effects, Demo preservation, next-run application/expiry and exclusion from seeded natural generation. Browser QA covers both claims, the animated specimen gallery and actual sipping.
