# Edit this Documentation

Go to the section and theme you want to change: On the left navigator.

Click **Edit on GitHub** on the right.

On the **Issue** tab you’ll find the open issues.
Read what need to be done by clicking on the issue you like to fix.

By going backwards in the browser **(!)**, again go to the **Code** tab.

Click on the **edit pencil** on the right side directly above the text to edit this file on your fork of Human Connection (HC).

You can see a preview of your changes by clicking the **Preview changes** tab aside the **Edit file** tab.

If you are ready, fill in the **Propose file change** at the end of the webpage.

After that you have to send your change to the HC basis with a pull request.
Here make a comment which issue you have fixed. At least the number.


## Markdown your documentation

To design your documentation see the syntax description at GitBook:

[https://toolchain.gitbook.com/syntax/markdown.html](https://toolchain.gitbook.com/syntax/markdown.html)

### Some quick Examples

#### Headlines
```markdown
# Main headline
## Smaller headlines
### Small headlines
```

#### Tabs
```markdown
{% tabs %}
{% tab title=„XXX“ %}
XXX
{% endtab %}
{% tab title=„XXX“ %}
XXX
{% endtab %}
…
{% endtabs %}
```

#### Commands
    ```LANGUAGE (for text highlighting)
    XXX
    ```

#### Links
```markdown
[https://XXX](XXX)
```

#### Screenshots or other Images
```markdown
![XXX](https://XXX)
```

#### Hints for ToDos
```markdown
{% hint style="info" %} TODO: XXX {% endhint %}
```

## Host the screenshots

### Host on Human Connection

{% hint style="info" %} TODO: How to host on Human Connection (GitHub) ... {% endhint %}

### Quick Solution

To quickly host the screenshots go to:

[https://imgur.com](https://imgur.com).

There click the green button **New post**.

Drag the image into the appropriate area.

Right click on it and choose kind of **Open link in new tab**.

Copy the URL and paste it were you need it.


## Screenshot modification

### Add an arrow or some other marking stuff

{% tabs %}

{% tab title=„mac OS“ %}

#### In the Preview App

Got to: **Menu** + **Tools** (GER: Werkzeuge) + **Annotate** (GER: Anmerkungen) + etc.

{% endtab %}

{% tab title=„Windows“ %}

{% hint style="info" %} TODO: How to modify screenshots ... {% endhint %}

{% endtab %}

{% tab title=„Linux“ %}

{% hint style="info" %} TODO: How to modify screenshots ... {% endhint %}

{% endtab %}

{% endtabs %}
