---
description: 'The styleguide is not just a guide, its also our Design System.'
---

# Styleguide

For this Projoject we decided to use [Jörg Bayreuther's](https://github.com/visualjerk) _\(visualjerk\)_ fantastic Design System called [CION](https://cion.visualjerk.de/). _\(see a_ [_demo_](https://styleguide.cion.visualjerk.de/)_\)_

![Styleguide in action under https://localhost:8080](../.gitbook/assets/screenshot-styleguide.png)

### Developing with the Styleguide

{% tabs %}
{% tab title="Yarn" %}
```bash
yarn styleguide
```
{% endtab %}

{% tab title="NPM" %}
```bash
npm run styleguide
```
{% endtab %}
{% endtabs %}

### Build

if you changed design tokens or other styles inside the styleguide, run the refresh command to build the styleguide as a lib.

{% hint style="info" %}
The Styleguide is build when installing the UI via Yarn or NPM, but when you have changes inside the styleguide, you will need to run following command so they will be repflected in the main UI

We want to improve this in the future while running `yarn dev`.
{% endhint %}

{% tabs %}
{% tab title="Yarn" %}
```bash
yarn styleguide:build
```
{% endtab %}

{% tab title="NPM" %}
```bash
npm run styleguide:build
```
{% endtab %}
{% endtabs %}

