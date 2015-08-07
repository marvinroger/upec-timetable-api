module.exports = {
  isInteger: function(x) {
    return (typeof x === 'number') && (x % 1 === 0);
  }
};