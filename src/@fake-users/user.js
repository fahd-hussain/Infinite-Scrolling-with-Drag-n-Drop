import mock from "./mock";
import users from "./users.json";

mock.onGet("/api/users", { page: 0, size: 50 }).reply((req) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let { page, size } = req.params;
      let offset = (page - 1) * size;
      let total = users.length;

      if (offset + size >= total) {
        size = total - offset;
      }

      const response = {
        documents: users.splice(offset, size),
        pagination: { page, size, total },
      };

      resolve([200, response]);
    }, 1500);
  });
});
