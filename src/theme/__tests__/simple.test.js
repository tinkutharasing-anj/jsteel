describe('Simple Test Suite', () => {
  it('should pass basic arithmetic', () => {
    expect(2 + 2).toBe(4);
    expect(10 - 5).toBe(5);
    expect(3 * 4).toBe(12);
    expect(15 / 3).toBe(5);
  });

  it('should handle strings', () => {
    expect('hello').toBe('hello');
    expect('world').toContain('orl');
    expect('testing').toHaveLength(7);
  });

  it('should handle arrays', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(arr).toHaveLength(5);
    expect(arr).toContain(3);
    expect(arr[0]).toBe(1);
    expect(arr[arr.length - 1]).toBe(5);
  });

  it('should handle objects', () => {
    const obj = { name: 'John', age: 30, city: 'New York' };
    expect(obj).toHaveProperty('name');
    expect(obj.name).toBe('John');
    expect(obj.age).toBe(30);
    expect(Object.keys(obj)).toHaveLength(3);
  });

  it('should handle async operations', async () => {
    const result = await Promise.resolve('success');
    expect(result).toBe('success');
  });

  it('should handle promises', () => {
    return Promise.resolve(42).then(value => {
      expect(value).toBe(42);
    });
  });
});
