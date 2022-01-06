import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Avatar, Grid, Paper, Typography } from "@mui/material";
import {
  SortableContainer,
  SortableElement,
  SortEnd,
} from "react-sortable-hoc";
import { arrayMoveImmutable } from "array-move";

interface userType {
  ID: string;
  JobTitle: string;
  Email: string;
  Name: string;
  Gender: string;
}

const wrapper = (props: any) => <div {...props}>{props.children}</div>;
const SortableItem = SortableElement(wrapper);
const SortableList = SortableContainer(wrapper);

const App: FC<{}> = () => {
  const [users, setUsers] = useState<Array<userType>>([]);
  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(50);
  const [more, setMore] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await axios.get("/api/users", {
        params: { page, size },
      });

      if (response.status !== 200) {
        setLoading(false);
        setError(true);
        return;
      }

      const { documents, pagination } = response.data;
      const { total } = pagination;
      setUsers((prevUsers) => [...prevUsers, ...documents]);
      setMore(Boolean(total - page * size));
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(true);
    }
  };

  const onSortEnd = ({ oldIndex, newIndex }: SortEnd) => {
    setUsers(arrayMoveImmutable(users, oldIndex, newIndex));
  };

  const handleUpdatePagination = (page?: number, size?: number) => {
    page && setPage(page);
    size && setSize(size);
  };

  const observer = useRef<IntersectionObserver>();
  const lastItemRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        debugger;
        if (entries[0].isIntersecting && more) {
          handleUpdatePagination(page + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, more]
  );

  return (
    <>
      <SortableList axis="xy" onSortEnd={onSortEnd}>
        <Grid container>
          {users.map((user: userType, index: number) => (
            <SortableItem key={`item-${index}`} index={index}>
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  m: 2,
                  maxWidth: 500,
                  minWidth: 500,
                }}
                ref={users.length === index + 1 ? lastItemRef : null}
              >
                <Grid container spacing={4}>
                  <Grid item>
                    <Avatar alt="complex" />
                  </Grid>
                  <Grid item xs={12} sm container>
                    <Grid item xs container direction="column" spacing={2}>
                      <Grid item xs>
                        <Typography
                          gutterBottom
                          variant="subtitle1"
                          component="div"
                        >
                          {user.Name}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          {user.JobTitle}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.Email}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid item>
                      <Typography variant="subtitle1" component="div">
                        {user.Gender}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Paper>
            </SortableItem>
          ))}
        </Grid>
      </SortableList>
      {loading && <div>Loading...</div>}
      {error && <div>Something went wrong</div>}
    </>
  );
};
export default App;
