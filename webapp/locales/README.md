# Primer on adding or updating a language file used in Human Connection

## Get the current files as base for changes

* Checkout the current repository if you have not done yet
  
    git clone https://github.com/Human-Connection/Human-Connection.git

* Update an already existing repository to the most recent state

    git checkout master
    git pull upstream master

* Create a branch for your coming changes based on the language code for your language.
  For a list of all the codes based on ISO-639 see [Wikipedia](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes).
  Use the two-letter code in column *639-1* like *en* or *de*.

  The branch name should help recognise what is happing in it. As a suggestion you could use the following pattern:

  * Start with _update_ for updates, _new_ for new languages
  * One minus sign
  * Your two-letter language code
  * Optionally another minus sign and short details if needed. Maybe a date or a release number if appropriate.
  * Do not use spaces in the branch name, replace them with underscores instead.
  
  For example:  update-it-rev_1.2.3

    git checkout -b update-it-rev_1.2.3

## Add a new language

    git add it.json

  blabla

## Update an existing language file

  blabla

## Release your changes

* Upload your changes to the offical repository
  
    git push origin update-it-rev_1.2.3

* Create a pull request for your branch on GitHub by visiting the according link in your browser:
  https://github.com/Human-Connection/Human-Connection/pull/new/update-it-rev_1.2.3

  If everything goes well, the maintainers will accept your request. Otherwise they will
  notify via the usual ways Github supports. Additionally all the messages appear on the above web site.
