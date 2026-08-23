import uniqueSlug from './uniqueSlug'

describe('uniqueSlug', () => {
  let isUnique

  beforeEach(() => {
    isUnique = jest.fn().mockResolvedValue(true)
  })

  it('slugifies given string', async () => {
    await expect(uniqueSlug('Hello World', isUnique)).resolves.toEqual('hello-world')
  })

  it('increments slugified string until unique', async () => {
    isUnique = jest.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true)
    await expect(uniqueSlug('Hello World', isUnique)).resolves.toEqual('hello-world-1')
  })

  it('slugify null string', async () => {
    await expect(uniqueSlug(null, isUnique)).resolves.toEqual('anonymous')
  })

  describe('given german umlauts', () => {
    const expectations = {
      'Sandra Märtens': 'sandra-maertens',
      'Oliver Stöckel': 'oliver-stoeckel',
      'Günter Hürst': 'guenter-huerst',
      'Änne Öhler': 'aenne-oehler',
      'Üwe Ärmel': 'uewe-aermel',
      Straße: 'strasse',
    }

    it('expands them instead of dropping the diaeresis', async () => {
      for (const [string, expected] of Object.entries(expectations)) {
        await expect(uniqueSlug(string, isUnique)).resolves.toEqual(expected)
      }
    })
  })

  describe('given decomposed umlauts', () => {
    it('treats them like their composed form', async () => {
      const decomposed = 'Sandra Märtens'.normalize('NFD')
      expect(decomposed).not.toEqual('Sandra Märtens'.normalize('NFC'))
      await expect(uniqueSlug(decomposed, isUnique)).resolves.toEqual('sandra-maertens')
    })
  })

  describe('given other special characters', () => {
    const expectations = {
      Владимир: 'vladimir',
      Nguyễn: 'nguyen',
      '5 € Preis': '5-euro-preis',
      'Émile Zola': 'emile-zola',
    }

    it('keeps transliterating them', async () => {
      for (const [string, expected] of Object.entries(expectations)) {
        await expect(uniqueSlug(string, isUnique)).resolves.toEqual(expected)
      }
    })
  })
})
