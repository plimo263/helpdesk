import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";
import { Body2, Icone } from "../components";
import { ButtonBase, IconButton, Menu, MenuItem, Stack } from "@mui/material";

function OptionsMenu({ component, title, icon, options }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const onViewMenu = useCallback(
    (e) => {
      setAnchorEl(e.currentTarget);
    },
    [setAnchorEl]
  );

  const closeMenu = useCallback(() => {
    setAnchorEl(null);
  }, [setAnchorEl]);

  const onClickItem = useCallback(
    (onClick) => {
      onClick();
      closeMenu();
    },
    [closeMenu]
  );

  return (
    <>
      {component ? (
        <ButtonBase onClick={onViewMenu}>{component}</ButtonBase>
      ) : (
        <IconButton title={title} onClick={onViewMenu}>
          <Icone icone={icon} />
        </IconButton>
      )}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        {options.map((ele, idx) => (
          <MenuItem key={idx} onClick={() => onClickItem(ele.onClick)}>
            <Stack direction="row" gap={1}>
              <Icone icone={ele.icon} />
              <Body2>{ele.label}</Body2>
            </Stack>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

OptionsMenu.defaultProps = {
  icon: "MoreVert",
  title: "Clique para ver as opções",
};

OptionsMenu.propTypes = {
  title: PropTypes.string,
  icon: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
    })
  ).isRequired,
};

export default OptionsMenu;
