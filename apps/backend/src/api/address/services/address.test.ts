import addressServiceFactory, { InvalidAreaIdError } from '../services/address'

describe('address service', () => {
  const service = addressServiceFactory({} as any)

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('getProvinces returns formatted data from wilayah.id', async () => {
    const mockData = [
      { code: '11', name: 'ACEH' },
      { code: '12', name: 'SUMATERA UTARA' },
    ]
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ data: mockData, meta: {} }),
    })

    const result = await service.getProvinces()

    expect(global.fetch).toHaveBeenCalledWith('https://wilayah.id/api/provinces.json')
    expect(result).toEqual({ data: mockData })
  })

  it('getRegencies passes the province id into the url', async () => {
    const mockData = [{ code: '11.01', name: 'Kabupaten Aceh Selatan' }]
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ data: mockData, meta: {} }),
    })

    const result = await service.getRegencies('11')

    expect(global.fetch).toHaveBeenCalledWith('https://wilayah.id/api/regencies/11.json')
    expect(result).toEqual({ data: mockData })
  })

  it('getDistricts passes the regency id into the url', async () => {
    const mockData = [{ code: '11.01.01', name: 'Bakongan' }]
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ data: mockData, meta: {} }),
    })

    const result = await service.getDistricts('11.01')

    expect(global.fetch).toHaveBeenCalledWith('https://wilayah.id/api/districts/11.01.json')
    expect(result).toEqual({ data: mockData })
  })

  it('throws when the regional data service returns a non-ok response', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false })

    await expect(service.getProvinces()).rejects.toThrow('The regional data service returned an error')
  })

  it('throws InvalidAreaIdError for a non-numeric province id', async () => {
    await expect(service.getRegencies('../provinces')).rejects.toBeInstanceOf(InvalidAreaIdError)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('throws InvalidAreaIdError for a regency id without the dot format', async () => {
    await expect(service.getDistricts('1101')).rejects.toBeInstanceOf(InvalidAreaIdError)
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
